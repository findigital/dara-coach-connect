import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { playAudioFromBlob } from "@/utils/audioUtils";
import SessionHeader from "./SessionHeader";
import SessionContent from "./SessionContent";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useMessageHandling } from "@/hooks/useMessageHandling";
import CircleWaveform from "./CircleWaveform";

const VoiceInteraction = () => {
  const [isActive, setIsActive] = useState(false);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notesContext, setNotesContext] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const {
    currentSessionId,
    startSession,
    endSession
  } = useSessionManagement();

  const {
    messages,
    setMessages,
    isLoading,
    sendMessage
  } = useMessageHandling(currentSessionId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSessionId) {
        endSession();
      }
    };
  }, [currentSessionId]);

  const handleStartSession = async () => {
    const result = await startSession();
    if (result) {
      setNotesContext(result.notesContext);
      const welcomeMessage = {
        role: 'assistant' as const,
        content: result.welcomeMessage
      };
      setMessages([welcomeMessage]);
      playMessage(welcomeMessage.content);
    }
  };

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

  const handleSendMessage = async (content: string) => {
    const reply = await sendMessage(content, notesContext);
    if (reply) {
      playMessage(reply);
    }
    setInput('');
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white flex flex-col">
        <SessionHeader
          currentSessionId={currentSessionId}
          isSpeaking={isSpeaking}
          toggleSpeech={toggleSpeech}
          endSession={endSession}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {!currentSessionId ? (
            <div className="flex flex-col items-center gap-8">
              <h1 className="text-3xl font-bold text-dara-navy">Speak with Dara</h1>
              <CircleWaveform />
            </div>
          ) : (
            <SessionContent
              currentSessionId={currentSessionId}
              messages={messages}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              isActive={isActive}
              setIsActive={setIsActive}
              onSendMessage={handleSendMessage}
              startSession={handleStartSession}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default VoiceInteraction;