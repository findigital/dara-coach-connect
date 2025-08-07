import { useState, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RealtimeChat } from '@/utils/RealtimeAudio';

export const useRealtimeVoice = (sessionId: string | null = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = useCallback((event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'conversation.message') {
      console.log('Message received:', event.message);
    }
  }, []);

  const startVoiceSession = async (overrideSessionId?: string | null) => {
    try {
      chatRef.current = new RealtimeChat(handleMessage, overrideSessionId ?? sessionId);
      await chatRef.current.init();
      setIsConnected(true);
      toast.success("Voice connection established");
    } catch (error) {
      console.error('Error starting voice session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start voice session');
      throw error;
    }
  };

  const endVoiceSession = () => {
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
      setIsConnected(false);
      toast.success("Voice session ended");
    }
  };

  return {
    isConnected,
    startVoiceSession,
    endVoiceSession
  };
};