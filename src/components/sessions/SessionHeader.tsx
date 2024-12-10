import { MessageCircle, Mic, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";

interface SessionHeaderProps {
  currentSessionId: string | null;
  isSpeaking: boolean;
  toggleSpeech: () => void;
  endSession: () => void;
}

const SessionHeader = ({ currentSessionId, isSpeaking, toggleSpeech, endSession }: SessionHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-dara-navy">Speak with Dara</h2>
        {currentSessionId && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSpeech}
              className="ml-2"
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <div className="flex items-center gap-2 ml-4 text-sm text-gray-500">
              <Mic className="h-4 w-4" />
              <span>Voice Mode</span>
            </div>
          </>
        )}
      </div>
      {currentSessionId && (
        <Button
          onClick={endSession}
          variant="outline"
          className="text-red-600 hover:bg-red-50"
        >
          End Session
        </Button>
      )}
    </CardHeader>
  );
};

export default SessionHeader;