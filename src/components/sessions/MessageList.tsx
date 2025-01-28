import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertLinksToAnchors } from "@/utils/textUtils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 text-slate-600",
              message.role === 'user' && "justify-end"
            )}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8">
                <div className="bg-dara-yellow rounded-full h-full w-full flex items-center justify-center text-dara-navy font-semibold">
                  D
                </div>
              </Avatar>
            )}
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[85%] leading-relaxed prose prose-sm",
                message.role === 'user' 
                  ? "bg-dara-yellow text-dara-navy"
                  : "bg-slate-100"
              )}
              dangerouslySetInnerHTML={{ 
                __html: convertLinksToAnchors(message.content) 
              }}
            />
            {message.role === 'user' && (
              <Avatar className="h-8 w-8">
                <div className="bg-dara-navy rounded-full h-full w-full flex items-center justify-center text-white font-semibold">
                  U
                </div>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageList;