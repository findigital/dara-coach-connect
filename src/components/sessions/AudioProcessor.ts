export class AudioProcessor {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioChunks: Blob[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private onAudioData: (data: Blob[]) => void;
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
  }

  private stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  cleanup() {
    this.stopProcessing();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}