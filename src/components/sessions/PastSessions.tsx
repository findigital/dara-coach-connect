import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { SessionList } from "./SessionList";
import { SessionDetails } from "./SessionDetails";
import type { Session, ActionItem } from "@/types/session";

const PastSessions = () => {
  const { session: authSession } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authSession?.user?.id) {
      fetchSessions();
    }
  }, [authSession?.user?.id]);

  const fetchSessions = async () => {
    try {
      if (!authSession?.user?.id) {
        console.error('No user ID available');
        return;
      }

      const { data, error } = await supabase
        .from('coaching_sessions')
        .select('id, title, started_at, summary')
        .eq('user_id', authSession.user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error("Failed to load sessions");
      setLoading(false);
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

      // If no summary exists, generate one
      const session = sessions.find(s => s.id === sessionId);
      if (session && !session.summary) {
        await generateSessionInsights(sessionId, 'summary');
        await generateSessionInsights(sessionId, 'action_items');
        await fetchSessions(); // Refresh sessions to get the new summary
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error("Failed to load session details");
    }
  };

  const generateSessionInsights = async (sessionId: string, type: 'title' | 'summary' | 'action_items') => {
    try {
      const response = await supabase.functions.invoke('generate-session-insights', {
        body: { sessionId, type },
      });

      if (response.error) throw response.error;
      toast.success(`Generated ${type} successfully`);
      await fetchSessions(); // Refresh the sessions list to show new data
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`Failed to generate ${type}`);
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

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    fetchSessionDetails(session.id);
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-dara-navy px-2">Past Sessions</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <SessionList
            sessions={sessions}
            selectedSessionId={selectedSession?.id || null}
            onSessionSelect={handleSessionSelect}
          />
          {selectedSession && (
            <SessionDetails
              session={selectedSession}
              actionItems={actionItems}
              onActionItemToggle={toggleActionItem}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PastSessions;