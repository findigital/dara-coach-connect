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
        <div className="space-y-6 pr-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-dara-yellow text-dara-navy ml-4'
                    : 'bg-gray-100 text-gray-800 mr-4'
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown 
                    className="prose prose-sm max-w-none dark:prose-invert prose-p:mb-4 prose-headings:mb-4 prose-headings:mt-6 prose-strong:text-dara-navy prose-strong:font-semibold"
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed whitespace-pre-line">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-dara-navy">
                          {children}
                        </strong>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-4 text-dara-navy">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mb-3 text-dara-navy">
                          {children}
                        </h2>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-4 space-y-2">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">
                          {children}
                        </li>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-line leading-relaxed">
                    {message.content}
                  </p>
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