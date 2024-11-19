import { toast } from "sonner";

export class AudioProcessor {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioChunks: Blob[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private onAudioData: (data: Blob[]) => void;
  private silenceStartTime: number | null = null;
  private readonly SILENCE_THRESHOLD = -50; // dB
  private readonly SILENCE_DURATION = 1000; // ms
  private readonly CHUNK_INTERVAL = 1000; // ms

  constructor(onAudioData: (data: Blob[]) => void) {
    this.onAudioData = onAudioData;
  }

  async initialize() {
    try {
      this.audioContext = new AudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (this.audioContext) {
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        source.connect(this.analyser);
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      return true;
    } catch (error) {
      console.error('Error initializing audio:', error);
      toast.error("Could not access microphone. Please check permissions.");
      return false;
    }
  }

  startRecording() {
    if (!this.mediaRecorder) return;
    
    this.audioChunks = [];
    this.mediaRecorder.start(this.CHUNK_INTERVAL);
    this.startProcessing();
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.stopProcessing();
  }

  private startProcessing() {
    this.processingInterval = setInterval(() => {
      if (this.audioChunks.length > 0) {
        this.onAudioData([...this.audioChunks]);
        this.audioChunks = [];
      }
    }, this.CHUNK_INTERVAL);

    this.detectSilence();
  }

  private stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  private detectSilence = () => {
    if (!this.analyser) return;

    const dataArray = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(dataArray);

    const rms = Math.sqrt(dataArray.reduce((acc, val) => acc + val * val, 0) / dataArray.length);
    const db = 20 * Math.log10(rms);

    if (db < this.SILENCE_THRESHOLD) {
      if (!this.silenceStartTime) {
        this.silenceStartTime = Date.now();
      } else if (Date.now() - this.silenceStartTime > this.SILENCE_DURATION) {
        if (this.audioChunks.length > 0) {
          this.onAudioData([...this.audioChunks]);
          this.audioChunks = [];
        }
        this.silenceStartTime = null;
      }
    } else {
      this.silenceStartTime = null;
    }

    requestAnimationFrame(this.detectSilence);
  };

  cleanup() {
    this.stopProcessing();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}