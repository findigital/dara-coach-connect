
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertLinksToAnchors } from "@/utils/textUtils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 pr-4 h-full">
      <div className="space-y-4 mb-4 p-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 text-slate-600 w-full",
              message.role === 'user' && "justify-end"
            )}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <div className="bg-dara-yellow rounded-full h-full w-full flex items-center justify-center text-dara-navy font-semibold">
                  D
                </div>
              </Avatar>
            )}
            <div className="flex flex-col gap-2 max-w-[80%] min-w-0">
              <div
                className={cn(
                  "rounded-lg px-4 py-2 leading-relaxed prose prose-sm break-words",
                  message.role === 'user' 
                    ? "bg-dara-yellow text-dara-navy"
                    : "bg-slate-100"
                )}
                dangerouslySetInnerHTML={{ 
                  __html: convertLinksToAnchors(message.content) 
                }}
              />
              {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                <div className="text-xs text-gray-500 pl-2">
                  <p className="font-medium mb-1">Sources:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {message.citations.map((citation, idx) => (
                      <li key={idx}>
                        <a 
                          href={citation} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {citation}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
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
