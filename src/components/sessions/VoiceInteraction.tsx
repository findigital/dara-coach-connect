import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

const VoiceInteraction = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-6">
      <div className="relative w-48 h-48 mb-8">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
        <div className="absolute inset-4 bg-blue-500/20 rounded-full animate-ping animation-delay-150" />
        <div className="absolute inset-8 bg-blue-500/30 rounded-full animate-ping animation-delay-300" />
        <Button
          variant="outline"
          size="icon"
          className="absolute inset-0 w-full h-full rounded-full border-4 border-dara-navy hover:bg-dara-yellow/10"
        >
          <Mic className="h-12 w-12 text-dara-navy" />
        </Button>
      </div>
      <p className="text-dara-navy text-lg font-medium">Tap to start speaking</p>
      <p className="text-gray-500 text-sm mt-2">Your AI coach is ready to listen</p>
    </div>
  );
};

export default VoiceInteraction;