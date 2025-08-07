import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export const useSessionManagement = () => {
  const { session } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const fetchPreviousSessionContext = async () => {
    try {
      // Fetch last session summary and action items
      const { data: sessions, error: sessionsError } = await supabase
        .from('coaching_sessions')
        .select(`
          summary,
          action_items (
            content,
            completed
          )
        `)
        .eq('user_id', session?.user?.id)
        .order('started_at', { ascending: false })
        .limit(1);

      if (sessionsError) throw sessionsError;

      // Fetch recent notes
      const { data: notes, error: notesError } = await supabase
        .from('session_notes')
        .select('content, created_at')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notesError) throw notesError;

      const lastSession = sessions?.[0];
      
      if (!lastSession && (!notes || notes.length === 0)) {
        return null;
      }

      let context = "Previous session context:\n";
      
      if (lastSession?.summary) {
        context += `\nLast session summary:\n${lastSession.summary}\n`;
      }

      if (lastSession?.action_items && lastSession.action_items.length > 0) {
        context += "\nAction items from last session:\n";
        lastSession.action_items.forEach((item: { content: string; completed: boolean }) => {
          context += `- ${item.content} (${item.completed ? 'Completed' : 'Pending'})\n`;
        });
      }

      if (notes && notes.length > 0) {
        context += "\nRecent session notes:\n";
        notes.forEach(note => {
          context += `- ${note.content}\n`;
        });
      }

      return context;
    } catch (error) {
      console.error('Error fetching session context:', error);
      return null;
    }
  };

  const startSession = async () => {
    try {
      const sessionContext = await fetchPreviousSessionContext();
      const welcomeMessage = sessionContext
        ? "Hi, I'm Dara, your AI mental health coach. I've reviewed your previous session notes and I'm here to continue supporting you on your journey. How are you feeling today?"
        : "Hi, I'm Dara, your AI mental health coach. I'm here to support you on your mental health journey. How are you feeling today?";

      const { data, error } = await supabase
        .from('coaching_sessions')
        .insert([{ user_id: session?.user?.id }])
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      toast.success("Coaching session started");
      return { 
        sessionId: data.id, 
        notesContext: sessionContext || "No previous session context available.",
        welcomeMessage
      };
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error("Failed to start session");
      return null;
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

      // Add a small delay to ensure all messages are persisted before generating insights
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate session insights
      await Promise.all([
        supabase.functions.invoke('generate-session-insights', {
          body: { sessionId: currentSessionId, type: 'title' },
        }),
        supabase.functions.invoke('generate-session-insights', {
          body: { sessionId: currentSessionId, type: 'summary' },
        }),
        supabase.functions.invoke('generate-session-insights', {
          body: { sessionId: currentSessionId, type: 'action_items' },
        }),
      ]);

      setCurrentSessionId(null);
      toast.success("Coaching session ended");
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error("Failed to end session");
    }
  };

  return {
    currentSessionId,
    setCurrentSessionId,
    startSession,
    endSession
  };
};