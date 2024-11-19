import { Mic, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

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
    // Initialize AudioContext
    audioContextRef.current = new AudioContext();

    // Request microphone permissions when component mounts
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

                // Add user's audio message
                setMessages(prev => [...prev, { role: 'user', content: 'Audio message sent' }]);
                
                // Add AI's response and play audio
                if (data.reply) {
                  setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                  if (data.audioResponse) {
                    playAudioResponse(data.audioResponse);
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

  const playAudioResponse = async (base64Audio: string) => {
    try {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      // Convert base64 to ArrayBuffer
      const binaryString = window.atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create audio buffer and play
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error("Failed to play audio response");
    }
  };

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
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const { data, error } = await supabase.functions.invoke('chat-with-dara', {
        body: { message: content },
      });

      if (error) throw error;

      const aiMessage: Message = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, aiMessage]);

      // Play audio response if available
      if (data.audioResponse) {
        playAudioResponse(data.audioResponse);
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