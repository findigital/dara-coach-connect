import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { playAudioFromBlob } from "@/utils/audioUtils";

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const welcomeMessage = {
        role: 'assistant' as const,
        content: "Hi, I'm Dara, your AI mental health coach. I'm here to support you on your journey to better mental well-being. Feel free to share what's on your mind, ask questions, or discuss any challenges you're facing. How are you feeling today?"
      };
      setMessages([welcomeMessage]);
      playMessage(welcomeMessage.content);
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

  const playMessage = async (text: string) => {
    try {
      console.log('Requesting text-to-speech for:', text);
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text },
      });

      if (response.error) {
        console.error('TTS API error:', response.error);
        throw response.error;
      }

      console.log('TTS response received:', response);
      
      // Convert the base64 string to a Blob
      const audioData = atob(response.data);
      const arrayBuffer = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        arrayBuffer[i] = audioData.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      
      const audio = await playAudioFromBlob(blob);
      audioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        toast.error("Failed to play audio");
      };
      
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error("Failed to play audio");
    }
  };

  const toggleSpeech = () => {
    if (audioRef.current) {
      if (isSpeaking) {
        audioRef.current.pause();
        setIsSpeaking(false);
      } else {
        audioRef.current.play();
        setIsSpeaking(true);
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentSessionId) return;

    try {
      setIsLoading(true);
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-with-dara', {
        body: { 
          message: content,
          conversationHistory: conversationHistory
        },
      });

      if (error) throw error;

      const aiMessage: Message = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, aiMessage]);
      playMessage(data.reply);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-dara-navy">Speak with Dara</h2>
            {currentSessionId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSpeech}
                className="ml-2"
              >
                {isSpeaking ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
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
        <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {currentSessionId ? (
            <>
              <MessageList messages={messages} />
              <MessageInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                isActive={isActive}
                setIsActive={setIsActive}
                onSendMessage={sendMessage}
              />
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