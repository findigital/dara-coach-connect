
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                  "rounded-lg px-4 py-2 leading-relaxed prose prose-sm break-words max-w-none",
                  message.role === 'user' 
                    ? "bg-dara-yellow text-dara-navy"
                    : "bg-slate-100"
                )}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-dara-navy">{children}</strong>,
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {children}
                        </a>
                      ),
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 text-dara-navy">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-dara-navy">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-dara-navy">{children}</h3>,
                      code: ({ children }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-dara-yellow pl-4 italic">{children}</blockquote>
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <span>{message.content}</span>
                )}
              </div>
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
