import { ScrollArea } from "@/components/ui/scroll-area";
import AudioWaveform from "./AudioWaveform";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isAudioPlaying?: boolean;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 h-[calc(100vh-300px)] pr-4">
      <div className="space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col gap-2 ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <AudioWaveform 
              isActive={message.isAudioPlaying || false} 
              isUser={message.role === 'user'} 
            />
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-dara-yellow text-dara-navy'
                  : 'bg-gray-100 text-gray-800'
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

export default MessageList;