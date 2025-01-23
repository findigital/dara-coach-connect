import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface VoiceChatButtonProps {
  onClick: () => void;
}

const VoiceChatButton = ({ onClick }: VoiceChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
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
  );
};

export default VoiceChatButton;