import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Mic } from "lucide-react";
import MessageList from "./MessageList";
import AudioWaveform from "./AudioWaveform";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SessionContentProps {
  currentSessionId: string | null;
  messages: Message[];
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  onSendMessage: (content: string) => void;
  startSession: () => void;
}

const SessionContent = ({
  currentSessionId,
  messages,
  isActive,
  setIsActive,
  startSession,
}: SessionContentProps) => {
  if (!currentSessionId) {
    return (
      <CardContent className="flex-1 flex items-center justify-center flex-col gap-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-dara-navy">Start Voice Session with Dara</h2>
          <p className="text-gray-600 max-w-md">
            Have a natural voice conversation with your AI mental health coach
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-8 w-full max-w-md px-4">
          <div className="relative w-32 h-32">
            <img 
              src="/lovable-uploads/60eebc39-8ebf-4f40-9f7b-48f7588e4222.png" 
              alt="Dara" 
              className="w-full h-full"
            />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl font-semibold text-dara-navy">Dara</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">Available</span>
            </div>
          </div>

          <Button
            onClick={startSession}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-full"
          >
            Start a call
          </Button>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
      <div className="flex-1">
        <MessageList messages={messages} />
      </div>
      
      <div className="flex flex-col items-center gap-4 py-6">
        {isActive ? (
          <>
            <AudioWaveform isActive={true} size="lg" />
            <Button
              onClick={() => setIsActive(false)}
              variant="destructive"
              size="lg"
              className="rounded-full px-8"
            >
              End Call
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsActive(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white h-16 w-16 rounded-full"
          >
            <Mic className="h-8 w-8" />
          </Button>
        )}
      </div>
    </CardContent>
  );
};

export default SessionContent;