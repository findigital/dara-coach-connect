
import { CardContent } from "@/components/ui/card";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useState } from "react";
import CircleWaveform from "./CircleWaveform";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <CardContent className="flex-1 flex flex-col h-full p-0 overflow-hidden">
      <div className="flex-1 overflow-hidden mb-2">
        <ScrollArea className="h-[calc(100%-120px)] max-h-[calc(100vh-300px)] pr-2">
          <MessageList messages={allMessages} />
        </ScrollArea>
      </div>
      <div className="flex justify-center py-1 mb-1">
        <CircleWaveform />
      </div>
      <div className="mt-auto px-2">
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
