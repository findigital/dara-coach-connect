
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import SessionHeader from "./SessionHeader";
import SessionContent from "./SessionContent";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useMessageHandling } from "@/hooks/useMessageHandling";
import PreSessionView from "./PreSessionView";
import AudioControls from "./AudioControls";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { toast } from "sonner";

const VoiceInteraction = () => {
  const [isActive, setIsActive] = useState(false);
  const [input, setInput] = useState('');
  const [notesContext, setNotesContext] = useState('');
  
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

  const { playMessage, toggleSpeech, isSpeaking } = AudioControls({
    onMessageReceived: (text) => {
      if (messages.length === 0) {
        setMessages([{ role: 'assistant', content: text }]);
      }
    }
  });

  const { startVoiceSession, endVoiceSession } = useRealtimeVoice();

  useEffect(() => {
    return () => {
      if (currentSessionId) {
        endSession();
        endVoiceSession();
      }
    };
  }, [currentSessionId]);

  const handleStartSession = async () => {
    try {
      await startVoiceSession();
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
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error("Failed to start voice session");
    }
  };

  const handleEndSession = async () => {
    endVoiceSession();
    await endSession();
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
      <Card className="h-full bg-white flex flex-col overflow-hidden">
        <SessionHeader
          currentSessionId={currentSessionId}
          isSpeaking={isSpeaking}
          toggleSpeech={toggleSpeech}
          endSession={handleEndSession}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {!currentSessionId ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <PreSessionView onStartSession={handleStartSession} />
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
