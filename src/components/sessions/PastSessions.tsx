import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Session {
  id: string;
  title: string;
  started_at: string;
  summary: string;
}

interface ActionItem {
  id: string;
  content: string;
  completed: boolean;
}

const PastSessions = () => {
  const { session: authSession } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [authSession?.user?.id]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('coaching_sessions')
        .select('id, title, started_at, summary')
        .eq('user_id', authSession?.user?.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error("Failed to load sessions");
    }
  };

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      // Fetch action items
      const { data: actionItemsData, error: actionItemsError } = await supabase
        .from('action_items')
        .select('*')
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

  return (
    <div className="h-full bg-gray-50">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-dara-navy px-2">Past Sessions</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="lg:h-[calc(100vh-8rem)] flex flex-col">
            <CardHeader>
              <h3 className="text-lg font-semibold text-dara-navy">Sessions History</h3>
              <p className="text-sm text-gray-500">Review your previous coaching sessions</p>
            </CardHeader>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`cursor-pointer transition-all hover:bg-gray-100 ${
                      selectedSession?.id === session.id ? 'bg-dara-yellow/10 border-dara-yellow' : ''
                    }`}
                    onClick={() => {
                      setSelectedSession(session);
                      fetchSessionDetails(session.id);
                    }}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-dara-navy">
                            {session.title || "Coaching Session"}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <CalendarDays className="h-4 w-4 mr-1" />
                            {new Date(session.started_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {selectedSession && (
            <Card className="lg:h-[calc(100vh-8rem)] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-dara-navy">{selectedSession.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedSession.started_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-dara-navy mb-2">Summary</h4>
                      <p className="text-gray-600">{selectedSession.summary || "Generating summary..."}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-dara-navy">Action Items</h4>
                      <div className="space-y-2">
                        {actionItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <Checkbox
                              id={item.id}
                              checked={item.completed}
                              onCheckedChange={(checked) => toggleActionItem(item.id, checked as boolean)}
                              className="mt-1"
                            />
                            <label
                              htmlFor={item.id}
                              className={`text-gray-700 cursor-pointer ${
                                item.completed ? "line-through text-gray-400" : ""
                              }`}
                            >
                              {item.content}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastSessions;