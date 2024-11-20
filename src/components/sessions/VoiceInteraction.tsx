import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
      // Add the welcome message
      setMessages([{
        role: 'assistant',
        content: "Hi, I'm Dara, your AI mental health coach. I'm here to support you on your journey to better mental well-being. Feel free to share what's on your mind, ask questions, or discuss any challenges you're facing. How are you feeling today?"
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

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat-with-dara', {
        body: { message: content },
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: Message = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, aiMessage]);
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
              {/* Messages Area */}
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

              {/* Input Area */}
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