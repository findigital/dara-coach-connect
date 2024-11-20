import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { MessageList } from "./MessageList";
import { Message } from "./types";
import { streamChatResponse } from "@/utils/chatUtils";

const VoiceInteraction = () => {
  const { session } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const startSession = async () => {
    try {
      const { data, error } = await supabase
        .from('coaching_sessions')
        .insert([
          { user_id: session?.user?.id }
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm Dara, your AI wellness coach. I'm here to listen and support you on your journey. How are you feeling today?"
      }]);
      toast.success("Coaching session started");
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error("Failed to start session");
    }
  };

  const endSession = async () => {
    if (!currentSessionId) return;

    try {
      const { error } = await supabase
        .from('coaching_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', currentSessionId);

      if (error) throw error;

      setCurrentSessionId(null);
      setMessages([]);
      toast.success("Coaching session ended");
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error("Failed to end session");
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentSessionId) return;

    try {
      setIsLoading(true);
      // Add user message
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Add an empty assistant message that will be updated with the stream
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // Stream the response
      await streamChatResponse(content, (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.content += chunk;
          return newMessages;
        });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold text-dara-navy">Speak with Dara</h2>
          {currentSessionId && (
            <Button
              onClick={endSession}
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              End Session
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          {currentSessionId ? (
            <>
              <MessageList messages={messages} />
              <div className="flex items-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="icon"
                  className={`${isActive ? 'bg-red-100 hover:bg-red-200' : ''}`}
                  onClick={() => setIsActive(!isActive)}
                >
                  <Mic className={`h-5 w-5 ${isActive ? 'text-red-500' : ''}`} />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      sendMessage(input);
                    }
                  }}
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="bg-dara-yellow text-dara-navy hover:bg-dara-yellow/90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-4">
              <p className="text-gray-500 text-center">
                Click "Start Session" to begin chatting with Dara
              </p>
              <Button
                onClick={startSession}
                className="bg-dara-yellow text-dara-navy hover:bg-dara-yellow/90"
              >
                Start Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;