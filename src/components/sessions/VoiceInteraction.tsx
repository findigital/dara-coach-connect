import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import SessionHeader from "./SessionHeader";
import SessionContent from "./SessionContent";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useMessageHandling } from "@/hooks/useMessageHandling";
import PreSessionView from "./PreSessionView";
import AudioControls from "./AudioControls";

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
            <PreSessionView onStartSession={handleStartSession} />
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