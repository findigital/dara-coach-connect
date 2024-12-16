import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { MessageCircle, Mic } from "lucide-react";
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
      <CardContent className="flex-1 flex items-center justify-center flex-col gap-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-dara-navy">Choose Your Conversation Style</h2>
          <p className="text-gray-600 max-w-md">
            Select how you'd like to interact with Dara today
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
          <Button
            onClick={startSession}
            className="flex flex-col items-center gap-4 p-8 h-auto bg-white border-2 border-dara-yellow hover:bg-dara-yellow/10 text-dara-navy group relative"
            variant="ghost"
          >
            <div className="flex flex-col items-center gap-4">
              <MessageCircle className="w-8 h-8" />
              <div className="space-y-2 text-center max-w-[200px]">
                <h3 className="font-semibold">Text Chat</h3>
                <p className="text-sm text-gray-600 whitespace-normal">
                  Type your messages and receive written responses from Dara
                </p>
              </div>
            </div>
          </Button>

          <Button
            onClick={startSession}
            className="flex flex-col items-center gap-4 p-8 h-auto bg-white border-2 border-dara-yellow hover:bg-dara-yellow/10 text-dara-navy group relative"
            variant="ghost"
          >
            <div className="flex flex-col items-center gap-4">
              <Mic className="w-8 h-8" />
              <div className="space-y-2 text-center max-w-[200px]">
                <h3 className="font-semibold">Voice Chat</h3>
                <p className="text-sm text-gray-600 whitespace-normal">
                  Have a natural voice conversation with Dara in real-time
                </p>
              </div>
            </div>
          </Button>
        </div>
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