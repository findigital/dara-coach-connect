import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SessionContentProps {
  currentSessionId: string | null;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  onSendMessage: (content: string) => void;
  startSession: () => void;
}

const SessionContent = ({
  currentSessionId,
  messages,
  input,
  setInput,
  isLoading,
  isActive,
  setIsActive,
  onSendMessage,
  startSession,
}: SessionContentProps) => {
  if (!currentSessionId) {
    return (
      <CardContent className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500 text-center">
          Click "Start Session" to begin chatting with Dara
        </p>
        <Button
          onClick={startSession}
          className="bg-dara-yellow text-dara-navy hover:bg-dara-yellow/90"
        >
          Start Session
        </Button>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
      <MessageList messages={messages} />
      <MessageInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        isActive={isActive}
        setIsActive={setIsActive}
        onSendMessage={onSendMessage}
      />
    </CardContent>
  );
};

export default SessionContent;