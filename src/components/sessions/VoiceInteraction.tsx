import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { playAudioFromBlob } from "@/utils/audioUtils";
import SessionHeader from "./SessionHeader";
import SessionContent from "./SessionContent";

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

  const fetchUserNotes = async () => {
    try {
      const { data: notes, error } = await supabase
        .from('session_notes')
        .select('content, created_at')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  };

  const startSession = async () => {
    try {
      const userNotes = await fetchUserNotes();
      const notesContext = userNotes.length > 0
        ? "Previous session notes:\n" + userNotes.map(note => `- ${note.content}`).join('\n')
        : "No previous session notes available.";

      const { data, error } = await supabase
        .from('coaching_sessions')
        .insert([{ user_id: session?.user?.id }])
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      const welcomeMessage = {
        role: 'assistant' as const,
        content: "Hi, I'm Dara, your AI mental health coach. I've reviewed your previous session notes and I'm here to continue supporting you on your journey. How are you feeling today?"
      };

      // Persist welcome message
      await supabase
        .from('chat_messages')
        .insert({
          session_id: data.id,
          role: welcomeMessage.role,
          content: welcomeMessage.content
        });

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
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text },
      });

      if (response.error) throw response.error;

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
      audio.onerror = () => toast.error("Failed to play audio");
      
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

      // Persist user message
      await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          role: userMessage.role,
          content: userMessage.content
        });

      const userNotes = await fetchUserNotes();
      const notesContext = userNotes.length > 0
        ? "Previous session notes:\n" + userNotes.map(note => `- ${note.content}`).join('\n')
        : "No previous session notes available.";

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-with-dara', {
        body: { 
          message: content,
          conversationHistory: conversationHistory,
          notesContext: notesContext
        },
      });

      if (error) throw error;

      const aiMessage: Message = { role: 'assistant', content: data.reply };
      
      // Persist AI message
      await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          role: aiMessage.role,
          content: aiMessage.content
        });

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
        <SessionHeader
          currentSessionId={currentSessionId}
          isSpeaking={isSpeaking}
          toggleSpeech={toggleSpeech}
          endSession={endSession}
        />
        <SessionContent
          currentSessionId={currentSessionId}
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          isActive={isActive}
          setIsActive={setIsActive}
          onSendMessage={sendMessage}
          startSession={startSession}
        />
      </Card>
    </div>
  );
};

export default VoiceInteraction;