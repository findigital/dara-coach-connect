interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          role === 'user'
            ? 'bg-dara-yellow text-dara-navy ml-4'
            : 'bg-gray-100 text-gray-800 mr-4'
        }`}
      >
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;