import { toast } from "sonner";

export const initializeAudioContext = () => {
  try {
    return new AudioContext();
  } catch (error) {
    console.error('Error initializing AudioContext:', error);
    toast.error("Failed to initialize audio context");
    return null;
  }
};

export const playAudioResponse = async (audioContext: AudioContext | null, base64Audio: string) => {
  try {
    if (!audioContext) return;

    const binaryString = window.atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.error('Error playing audio:', error);
    toast.error("Failed to play audio response");
  }
};