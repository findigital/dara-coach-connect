import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex-1 h-[calc(100vh-300px)]">
      <ScrollArea className="h-full">
        <div className="space-y-4 pr-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-dara-yellow text-dara-navy ml-4'
                    : 'bg-gray-100 text-gray-800 mr-4'
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown
                    className="prose prose-sm max-w-none dark:prose-invert prose-table:text-xs [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_tr]:border"
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            {children}
                          </table>
                        </div>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;