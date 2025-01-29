import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { playAudioFromBlob } from "@/utils/audioUtils";

interface AudioControlsProps {
  onMessageReceived?: (text: string) => void;
}

const AudioControls = ({ onMessageReceived }: AudioControlsProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playMessage = async (text: string) => {
    try {
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text },
      });

      if (response.error) throw response.error;

      const audioData = atob(response.data);
      const arrayBuffer = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        arrayBuffer[i] = audioData.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      
      const audio = await playAudioFromBlob(blob);
      audioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => toast.error("Failed to play audio");
      
      audio.play();
      if (onMessageReceived) {
        onMessageReceived(text);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error("Failed to play audio");
    }
  };

  const toggleSpeech = () => {
    if (audioRef.current) {
      if (isSpeaking) {
        audioRef.current.pause();
        setIsSpeaking(false);
      } else {
        audioRef.current.play();
        setIsSpeaking(true);
      }
    }
  };

  return { playMessage, toggleSpeech, isSpeaking };
};

export default AudioControls;