import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { SessionList } from "./SessionList";
import { SessionDetails } from "./SessionDetails";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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

  // Realtime subscriptions for sessions and action items
  useEffect(() => {
    if (!authSession?.user?.id) return;

    const sessionsChannel = supabase
      .channel('coaching_sessions_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'coaching_sessions', filter: `user_id=eq.${authSession.user.id}` },
        (payload) => {
          refetch();
          if (selectedSession && (payload as any).new?.id === selectedSession.id) {
            setSelectedSession(prev => prev ? { ...prev, ...(payload as any).new } as Session : prev);
            if (!selectedSession.summary && (payload as any).new?.summary) {
              toast.success('Session summary updated');
            }
          }
        }
      )
      .subscribe();

    let itemsChannel: any = null;

    if (selectedSession?.id) {
      itemsChannel = supabase
        .channel(`action_items_${selectedSession.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'action_items', filter: `session_id=eq.${selectedSession.id}` },
          () => {
            fetchSessionDetails(selectedSession.id);
            toast.success('New action items added');
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(sessionsChannel);
      if (itemsChannel) supabase.removeChannel(itemsChannel);
    };
  }, [authSession?.user?.id, selectedSession?.id]);

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

  const handleActionItemEdit = (actionItemId: string, newContent: string) => {
    setActionItems(items =>
      items.map(item =>
        item.id === actionItemId ? { ...item, content: newContent } : item
      )
    );
  };

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    fetchSessionDetails(session.id);
  };

  const handleRefresh = async () => {
    await refetch();
    if (selectedSession) {
      await fetchSessionDetails(selectedSession.id);
    }
    toast.success('Refreshed');
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
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleRefresh}>Refresh</Button>
        </div>
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
              onActionItemEdit={handleActionItemEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PastSessions;