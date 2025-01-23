import { useState, useRef, useEffect } from "react";
import { Tool } from "@/lib/tools";
import { supabase } from "@/integrations/supabase/client";

const useWebRTCAudioSession = (voice: string, tools?: Tool[]) => {
  const [status, setStatus] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const functionRegistry = useRef<Record<string, Function>>({});
  const [currentVolume, setCurrentVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  const registerFunction = (name: string, fn: Function) => {
    functionRegistry.current[name] = fn;
  };

  const configureDataChannel = (dataChannel: RTCDataChannel) => {
    const sessionUpdate = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        tools: tools || []
      }
    };

    dataChannel.send(JSON.stringify(sessionUpdate));
  };

  const handleDataChannelMessage = async (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'response.function_call_arguments.done') {
        const fn = functionRegistry.current[msg.name];
        if (fn) {
          const args = JSON.parse(msg.arguments);
          const result = await fn(args);

          const response = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: msg.call_id,
              output: JSON.stringify(result)
            }
          };

          dataChannelRef.current?.send(JSON.stringify(response));
        }
      }
      setMsgs(prevMsgs => [...prevMsgs, msg]);
      return msg;
    } catch (error) {
      console.error('Error handling data channel message:', error);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  const getEphemeralToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-openai-token', {
        body: { voice },
      });
      
      if (error) {
        console.error('Error getting ephemeral token:', error);
        throw error;
      }
      
      if (!data?.token) {
        throw new Error('No token received from the server');
      }
      
      return data.token;
    } catch (error) {
      console.error('Failed to get ephemeral token:', error);
      throw error;
    }
  };

  const setupAudioVisualization = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;

    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateIndicator = () => {
      if (!audioContext) return;

      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle("active", average > 30);
      }

      requestAnimationFrame(updateIndicator);
    };

    updateIndicator();
    audioContextRef.current = audioContext;
  };

  const getVolume = (): number => {
    if (!analyserRef.current) return 0;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128;
      sum += float * float;
    }
    
    return Math.sqrt(sum / dataArray.length);
  };

  const startSession = async () => {
    try {
      setStatus("Requesting microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setupAudioVisualization(stream);

      setStatus("Fetching ephemeral token...");
      const ephemeralToken = await getEphemeralToken();

      setStatus("Establishing connection...");

      const pc = new RTCPeerConnection();
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        
        const audioContext = new (window.AudioContext || window.AudioContext)();
        const source = audioContext.createMediaStreamSource(e.streams[0]);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        source.connect(analyser);
        analyserRef.current = analyser;

        volumeIntervalRef.current = window.setInterval(() => {
          const volume = getVolume();
          setCurrentVolume(volume);
          
          if (volume > 0.1) {
            console.log('Speech detected with volume:', volume);
          }
        }, 100);
      };

      const dataChannel = pc.createDataChannel('response');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        configureDataChannel(dataChannel);
      };

      dataChannel.onmessage = handleDataChannelMessage;

      pc.addTrack(stream.getTracks()[0]);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      console.log('Making request to OpenAI with URL:', `${baseUrl}?model=${model}&voice=${voice}`);
      
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed with status ${response.status}`);
      }

      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      peerConnectionRef.current = pc;
      setIsSessionActive(true);
      setStatus("Session established successfully!");
    } catch (err) {
      console.error('Error starting session:', err);
      setStatus(`Error: ${err}`);
      stopSession();
    }
  };

  const stopSession = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove("active");
    }

    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    
    setCurrentVolume(0);
    setIsSessionActive(false);
    setStatus("");
    setMsgs([]);
  };

  const handleStartStopClick = () => {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    startSession,
    stopSession,
    handleStartStopClick,
    registerFunction,
    msgs,
    currentVolume
  };
};

export default useWebRTCAudioSession;