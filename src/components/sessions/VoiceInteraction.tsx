import { Mic, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { initializeAudioContext, playAudioResponse } from "./utils/audioUtils";
import ChatMessage from "./ChatMessage";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const VoiceInteraction = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = initializeAudioContext();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const reader = new FileReader();
            
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              try {
                const { data, error } = await supabase.functions.invoke('realtime-chat', {
                  body: { audio: base64Audio },
                });

                if (error) throw error;

                if (data.reply) {
                  setMessages(prev => [
                    ...prev,
                    { role: 'user', content: 'Audio message sent' },
                    { role: 'assistant', content: data.reply }
                  ]);
                  
                  if (data.audioResponse) {
                    await playAudioResponse(audioContextRef.current, data.audioResponse);
                  }
                }
              } catch (error) {
                console.error('Error processing audio:', error);
                toast.error("Failed to process audio. Please try again.");
              }
            };
            
            reader.readAsDataURL(audioBlob);
            audioChunksRef.current = [];
          };
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          toast.error("Could not access microphone. Please check permissions.");
        });
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!mediaRecorderRef.current) {
      toast.error("Microphone not initialized");
      return;
    }

    if (isRecording) {
      mediaRecorderRef.current.stop();
    } else {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content }]);
      setInput('');

      const { data, error } = await supabase.functions.invoke('chat-with-dara', {
        body: { message: content },
      });

      if (error) throw error;

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.audioResponse) {
          await playAudioResponse(audioContextRef.current, data.audioResponse);
        }
      }
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
          <Toggle
            pressed={isVoiceMode}
            onPressedChange={setIsVoiceMode}
            aria-label="Toggle voice mode"
            className="ml-2"
          >
            {isVoiceMode ? <Mic className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </Toggle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} {...message} />
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 pt-4">
            {isVoiceMode ? (
              <Button
                variant="outline"
                size="icon"
                className={`${isRecording ? 'bg-red-100 hover:bg-red-200' : ''}`}
                onClick={toggleRecording}
              >
                <Mic className={`h-5 w-5 ${isRecording ? 'text-red-500' : ''}`} />
              </Button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;