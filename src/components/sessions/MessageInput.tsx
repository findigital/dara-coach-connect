import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  onSendMessage: (content: string) => void;
}

// Define the SpeechRecognition type
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const MessageInput = ({ 
  input, 
  setInput, 
  isLoading, 
  isActive, 
  setIsActive, 
  onSendMessage 
}: MessageInputProps) => {
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInput(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsActive(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [setInput, setIsActive]);

  const toggleMic = () => {
    if (!recognition.current) {
      console.error('Speech recognition not supported');
      return;
    }

    if (isActive) {
      recognition.current.stop();
    } else {
      setInput(''); // Clear input when starting new recording
      recognition.current.start();
    }
    setIsActive(!isActive);
  };

  return (
    <div className="flex items-center gap-2 pt-4">
      <Button
        variant="outline"
        size="icon"
        className={`${isActive ? 'bg-red-100 hover:bg-red-200' : ''}`}
        onClick={toggleMic}
      >
        <Mic className={`h-5 w-5 ${isActive ? 'text-red-500' : ''}`} />
      </Button>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 h-16 py-2"
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