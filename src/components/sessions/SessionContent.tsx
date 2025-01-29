import { CardContent } from "@/components/ui/card";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useState } from "react";
import CircleWaveform from "./CircleWaveform";

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
}: SessionContentProps) => {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const allMessages = [...messages, ...localMessages];

  return (
    <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
      <div className="flex-1">
        <MessageList messages={allMessages} />
      </div>
      <div className="flex justify-center mb-4">
        <CircleWaveform />
      </div>
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