import { CardContent } from "@/components/ui/card";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import AudioWaveform from "./AudioWaveform";
import TextChatButton from "./buttons/TextChatButton";
import VoiceChatButton from "./buttons/VoiceChatButton";

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
          <TextChatButton 
            onClick={() => {
              setIsActive(false);
              startSession();
            }}
          />
          <VoiceChatButton 
            onClick={() => {
              setIsActive(true);
              startSession();
            }}
          />
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
      <MessageList messages={messages} />
      {isActive && <AudioWaveform isActive={isActive} />}
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