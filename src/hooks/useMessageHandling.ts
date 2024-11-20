import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useMessageHandling = (currentSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string, notesContext: string) => {
    if (!content.trim() || !currentSessionId) return;

    try {
      setIsLoading(true);
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Persist user message
      await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          role: userMessage.role,
          content: userMessage.content
        });

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
      return aiMessage.content;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage
  };
};