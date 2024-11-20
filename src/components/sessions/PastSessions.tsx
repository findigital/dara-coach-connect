import { useState } from "react";
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

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['past-sessions', authSession?.user?.id],
    queryFn: async () => {
      if (!authSession?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('coaching_sessions')
        .select('id, title, started_at, summary')
        .eq('user_id', authSession.user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      // For sessions without summaries, generate them
      const sessionsToProcess = (data || []).filter(session => !session.summary);
      if (sessionsToProcess.length > 0) {
        toast.info("Generating summaries for recent sessions...");
        await Promise.all(
          sessionsToProcess.map(session => 
            generateSessionInsights(session.id, 'summary')
              .then(() => generateSessionInsights(session.id, 'action_items'))
          )
        );
      }
      
      return data || [];
    },
    refetchInterval: (data = []) => {
      // Check if any sessions are missing summaries
      const hasPendingSummaries = data.some(session => !session.summary);
      // Refetch every 5 seconds if there are pending summaries, otherwise stop polling
      return hasPendingSummaries ? 5000 : false;
    },
  });

  const generateSessionInsights = async (sessionId: string, type: 'title' | 'summary' | 'action_items') => {
    try {
      const response = await supabase.functions.invoke('generate-session-insights', {
        body: { sessionId, type },
      });

      if (response.error) throw response.error;
      
      toast.success(`Generated ${type} successfully`);
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`Failed to generate ${type}`);
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