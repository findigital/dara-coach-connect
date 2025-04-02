
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
    <CardContent className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto mb-4">
        <MessageList messages={allMessages} />
      </div>
      <div className="flex justify-center mb-4">
        <CircleWaveform />
      </div>
      <div className="mt-auto">
        <MessageInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          isActive={isActive}
          setIsActive={setIsActive}
          onSendMessage={onSendMessage}
        />
      </div>
    </CardContent>
  );
};

export default SessionContent;
