import { Volume2, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioControlsProps {
  isRecording: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  callStatus: 'available' | 'on-call' | 'ended';
}

const AudioControls = ({ isRecording, onStartCall, onEndCall, callStatus }: AudioControlsProps) => {
  return (
    <div className="flex gap-4">
      {callStatus === 'available' && (
        <Button
          onClick={onStartCall}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 flex items-center gap-2"
        >
          <Mic className="h-4 w-4" />
          Connect
        </Button>
      )}

      {callStatus === 'on-call' && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={onEndCall}
          >
            <X className="h-5 w-5" />
          </Button>
        </>
      )}

      {callStatus === 'ended' && (
        <Button
          onClick={onStartCall}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 flex items-center gap-2"
        >
          <Mic className="h-4 w-4" />
          Connect
        </Button>
      )}
    </div>
  );
};

export default AudioControls;