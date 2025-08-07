import { supabase } from "@/integrations/supabase/client";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;
  private sessionId: string | null = null;
  private currentUserTranscript = '';
  private currentAssistantTranscript = '';

  constructor(private onMessage: (message: any) => void, sessionId: string | null = null) {
    console.log("🎯 RealtimeChat constructor - sessionId received:", sessionId);
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    this.sessionId = sessionId;
    console.log("🎯 RealtimeChat constructor - sessionId set to:", this.sessionId);
  }

  async init() {
    try {
      const tokenResponse = await supabase.functions.invoke("get-openai-token", {
        body: { voice: "alloy" }
      });

      if (tokenResponse.error) {
        throw new Error(tokenResponse.error.message);
      }

      const data = tokenResponse.data;
      if (!data?.token) {
        throw new Error("Failed to get ephemeral token");
      }

      this.pc = new RTCPeerConnection();
      this.pc.ontrack = e => this.audioEl.srcObject = e.streams[0];

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);

      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("🎤 Received WebRTC event:", event.type, event);
        this.handleRealtimeEvent(event);
        this.onMessage(event);
      });

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/sdp"
        },
      });

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

      // Send session configuration to enable input audio transcription
      this.dc.addEventListener("open", () => {
        console.log("🔗 Data channel opened, configuring session...");
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: "You are Dara, a supportive AI coach. Have natural conversations and provide guidance.",
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8
          }
        };
        this.dc?.send(JSON.stringify(sessionConfig));
        console.log("📝 Sent session configuration:", sessionConfig);
      });

      this.recorder = new AudioRecorder((audioData) => {
        if (this.dc?.readyState === 'open') {
          this.dc.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: this.encodeAudioData(audioData)
          }));
        }
      });
      await this.recorder.start();

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  private encodeAudioData(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  async sendMessage(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({type: 'response.create'}));
  }

  private async handleRealtimeEvent(event: any) {
    try {
      // Log ALL events for debugging
      console.log("🔍 ALL EVENT TYPES:", event.type, event);
      console.log("🔍 Current sessionId in handleRealtimeEvent:", this.sessionId);
      
      if (!this.sessionId) {
        console.log("⚠️ No sessionId available, skipping message save. Available sessionId:", this.sessionId);
        // Try to get the most recent active session as fallback
        await this.tryGetActiveSession();
        if (!this.sessionId) {
          console.log("⚠️ Still no sessionId after fallback attempt");
          return;
        }
      }

      // Handle session events
      if (event.type === 'session.created') {
        console.log("🎯 Session created successfully");
      }

      if (event.type === 'session.updated') {
        console.log("🎯 Session updated successfully");
      }

      // Handle user speech transcription completion - this is the key event we need
      if (event.type === 'conversation.item.input_audio_transcription.completed') {
        const transcript = event.transcript?.trim();
        console.log("👤 User transcript completed:", transcript, "Full event:", event);
        if (transcript) {
          await this.saveMessage('user', transcript);
        }
      }

      // Handle user speech transcription failure
      if (event.type === 'conversation.item.input_audio_transcription.failed') {
        console.error("❌ User transcript failed:", event);
      }

      // Handle user input audio transcription deltas (building up the transcript)
      if (event.type === 'conversation.item.input_audio_transcription.delta') {
        this.currentUserTranscript += event.delta || '';
        console.log("👤 User transcript delta:", event.delta, "Current:", this.currentUserTranscript);
      }

      // Save user transcript when transcription is done
      if (event.type === 'conversation.item.input_audio_transcription.done') {
        const transcript = this.currentUserTranscript.trim();
        console.log("👤 User transcript done:", transcript, "Full event:", event);
        if (transcript) {
          await this.saveMessage('user', transcript);
        }
        this.currentUserTranscript = '';
      }
      
      // Handle assistant response transcription - collect deltas
      if (event.type === 'response.audio_transcript.delta') {
        this.currentAssistantTranscript += event.delta || '';
        console.log("🤖 Assistant transcript delta:", event.delta, "Current:", this.currentAssistantTranscript);
      }
      
      // Save complete assistant response when done
      if (event.type === 'response.audio_transcript.done') {
        const transcript = this.currentAssistantTranscript.trim();
        console.log("🤖 Assistant transcript done:", transcript, "Full event:", event);
        if (transcript) {
          await this.saveMessage('assistant', transcript);
        }
        this.currentAssistantTranscript = '';
      }

      // Handle conversation items (alternative path for messages)
      if (event.type === 'conversation.item.created' && event.item) {
        const item = event.item;
        console.log("💬 Conversation item created:", item);
        if (item.type === 'message' && item.content) {
          for (const content of item.content) {
            if (content.type === 'text' && content.text) {
              await this.saveMessage(item.role, content.text);
            } else if (content.type === 'input_audio' || content.type === 'audio') {
              console.log("🎵 Audio content detected in conversation item");
            }
          }
        }
      }

      // Handle response events
      if (event.type === 'response.created') {
        console.log("🎯 Response created");
      }

      if (event.type === 'response.done') {
        console.log("🎯 Response completed");
      }

      // Handle input audio buffer events
      if (event.type === 'input_audio_buffer.speech_started') {
        console.log("🎤 User started speaking");
      }
      
      if (event.type === 'input_audio_buffer.speech_stopped') {
        console.log("🔇 User stopped speaking");
      }

      if (event.type === 'input_audio_buffer.committed') {
        console.log("📝 Audio buffer committed");
      }

      // Handle turn detection events
      if (event.type === 'conversation.item.truncated') {
        console.log("✂️ Conversation item truncated");
      }

      // Handle errors
      if (event.type === 'error') {
        console.error("❌ OpenAI Realtime API Error:", event);
      }

    } catch (error) {
      console.error('❌ Error handling realtime event:', error);
    }
  }

  private async saveMessage(role: 'user' | 'assistant', content: string) {
    if (!this.sessionId || !content.trim()) {
      console.log(`⚠️ Skipping save - sessionId: ${this.sessionId}, content: "${content}"`);
      return;
    }

    try {
      console.log(`💾 Saving ${role} message to DB:`, content.trim());
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: this.sessionId,
          role,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Error saving message to database:', error);
      } else {
        console.log(`✅ Successfully saved ${role} message:`, content.trim());
      }
    } catch (error) {
      console.error('❌ Error in saveMessage:', error);
    }
  }

  private async tryGetActiveSession() {
    try {
      console.log("🔄 Attempting to get active session as fallback");
      const { data: sessions, error } = await supabase
        .from('coaching_sessions')
        .select('id')
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("❌ Error fetching active session:", error);
        return;
      }

      if (sessions && sessions.length > 0) {
        this.sessionId = sessions[0].id;
        console.log("✅ Found active session as fallback:", this.sessionId);
      } else {
        console.log("⚠️ No active sessions found");
      }
    } catch (error) {
      console.error("❌ Error in tryGetActiveSession:", error);
    }
  }

  disconnect() {
    this.recorder?.stop();
    this.dc?.close();
    this.pc?.close();
  }
}