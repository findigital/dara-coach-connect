import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export const useSessionManagement = () => {
  const { session } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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
      toast.success("Coaching session started");
      return { sessionId: data.id, notesContext };
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
    endSession,
    fetchUserNotes
  };
};