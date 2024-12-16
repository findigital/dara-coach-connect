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
      <CardContent className="flex-1 flex items-center justify-center flex-col gap-8 p-4 md:p-6">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-dara-navy">Choose Your Conversation Style</h2>
          <p className="text-gray-600 text-sm md:text-base px-4">
            Select how you'd like to interact with Dara today
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl px-4">
          <Button
            onClick={startSession}
            className="flex flex-col items-center gap-4 p-6 md:p-8 h-auto bg-white border-2 border-dara-yellow hover:bg-dara-yellow/10 text-dara-navy group relative"
            variant="ghost"
          >
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
              <div className="space-y-1 md:space-y-2 text-center">
                <h3 className="font-semibold text-sm md:text-base">Text Chat</h3>
                <p className="text-xs md:text-sm text-gray-600 max-w-[200px]">
                  Type your messages and receive written responses from Dara
                </p>
              </div>
            </div>
          </Button>

          <Button
            onClick={startSession}
            className="flex flex-col items-center gap-4 p-6 md:p-8 h-auto bg-white border-2 border-dara-yellow hover:bg-dara-yellow/10 text-dara-navy group relative"
            variant="ghost"
          >
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <Mic className="w-6 h-6 md:w-8 md:h-8" />
              <div className="space-y-1 md:space-y-2 text-center">
                <h3 className="font-semibold text-sm md:text-base">Voice Chat</h3>
                <p className="text-xs md:text-sm text-gray-600 max-w-[200px]">
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
    <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden p-4 md:p-6">
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