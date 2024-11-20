import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { SessionList } from "./SessionList";
import { SessionDetails } from "./SessionDetails";
import { useQuery } from "@tanstack/react-query";
import type { Session, ActionItem } from "@/types/session";

const PastSessions = () => {
  const { session: authSession } = useAuth();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['past-sessions', authSession?.user?.id],
    queryFn: async () => {
      if (!authSession?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('coaching_sessions')
        .select('id, title, started_at, summary')
        .eq('user_id', authSession.user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Auto-select first session when data is loaded
  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSession) {
      handleSessionSelect(sessions[0]);
    }
  }, [sessions]);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // Delete associated action items first
      await supabase
        .from('action_items')
        .delete()
        .eq('session_id', sessionId);

      // Delete associated chat messages
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      // Finally delete the session
      const { error } = await supabase
        .from('coaching_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setActionItems([]);
      }

      refetch();
      toast.success("Session deleted successfully");
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error("Failed to delete session");
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const { data: actionItemsData, error: actionItemsError } = await supabase
        .from('action_items')
        .select('id, content, completed')
        .eq('session_id', sessionId);

      if (actionItemsError) throw actionItemsError;
      setActionItems(actionItemsData || []);
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error("Failed to load session details");
    }
  };

  const toggleActionItem = async (actionItemId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .update({ completed })
        .eq('id', actionItemId);

      if (error) throw error;
      setActionItems(items =>
        items.map(item =>
          item.id === actionItemId ? { ...item, completed } : item
        )
      );
      toast.success("Action item updated");
    } catch (error) {
      console.error('Error updating action item:', error);
      toast.error("Failed to update action item");
    }
  };

  const handleActionItemDelete = (actionItemId: string) => {
    setActionItems(items => items.filter(item => item.id !== actionItemId));
  };

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    fetchSessionDetails(session.id);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="p-4 space-y-4">
        <div className="grid lg:grid-cols-2 gap-6">
          <SessionList
            sessions={sessions || []}
            selectedSessionId={selectedSession?.id || null}
            onSessionSelect={handleSessionSelect}
            onDeleteSession={handleDeleteSession}
          />
          {selectedSession && (
            <SessionDetails
              session={selectedSession}
              actionItems={actionItems}
              onActionItemToggle={toggleActionItem}
              onActionItemDelete={handleActionItemDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PastSessions;