import CircleWaveform from "./CircleWaveform";
import { Button } from "@/components/ui/button";

interface PreSessionViewProps {
  onStartSession: () => void;
}

const PreSessionView = ({ onStartSession }: PreSessionViewProps) => {
  return (
    <div className="flex flex-col items-center gap-8">
      <CircleWaveform />
      <Button
        onClick={onStartSession}
        className="bg-primary hover:bg-primary/90 text-white"
        size="lg"
      >
        Start Session
      </Button>
    </div>
  );
};

export default PreSessionView;