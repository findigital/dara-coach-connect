import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface TextChatButtonProps {
  onClick: () => void;
}

const TextChatButton = ({ onClick }: TextChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="flex flex-col items-center gap-4 p-8 h-auto bg-white border-2 border-dara-yellow hover:bg-dara-yellow/10 text-dara-navy group relative"
      variant="ghost"
    >
      <div className="flex flex-col items-center gap-4">
        <MessageCircle className="w-8 h-8" />
        <div className="space-y-2 text-center max-w-[200px]">
          <h3 className="font-semibold">Text Chat</h3>
          <p className="text-sm text-gray-600 whitespace-normal">
            Type your messages and receive written responses from Dara
          </p>
        </div>
      </div>
    </Button>
  );
};

export default TextChatButton;