import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  onSendMessage: (content: string) => void;
}

const MessageInput = ({ 
  input, 
  setInput, 
  isLoading, 
  isActive, 
  setIsActive, 
  onSendMessage 
}: MessageInputProps) => {
  return (
    <div className="flex items-center gap-2 pt-4">
      <Button
        variant="outline"
        size="icon"
        className={`${isActive ? 'bg-red-100 hover:bg-red-200' : ''}`}
        onClick={() => setIsActive(!isActive)}
      >
        <Mic className={`h-5 w-5 ${isActive ? 'text-red-500' : ''}`} />
      </Button>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !isLoading) {
            onSendMessage(input);
          }
        }}
      />
      <Button
        onClick={() => onSendMessage(input)}
        disabled={isLoading || !input.trim()}
        className="bg-dara-yellow text-dara-navy hover:bg-dara-yellow/90"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MessageInput;