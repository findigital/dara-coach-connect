import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-dara-yellow text-dara-navy ml-4'
                  : 'bg-gray-100 text-gray-800 mr-4'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};