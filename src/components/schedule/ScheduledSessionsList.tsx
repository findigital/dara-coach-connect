import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Calendar as CalendarIcon } from "lucide-react";
import { EmptySchedule } from "./EmptySchedule";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ScheduledSession = Tables<'scheduled_sessions'>;

interface ScheduledSessionsListProps {
  sessions: ScheduledSession[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export const ScheduledSessionsList = ({ 
  sessions, 
  isLoading, 
  onDelete 
}: ScheduledSessionsListProps) => {
  // Fetch user's timezone from profile
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();
      
      return data;
    }
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: userProfile?.timezone || 'UTC'
    }).format(date);
  };

  // Filter out past sessions
  const upcomingSessions = sessions.filter(session => {
    const sessionDate = new Date(session.scheduled_for);
    const now = new Date();
    return sessionDate > now;
  });

  return (
    <Card className="lg:h-[calc(100vh-8rem)] flex flex-col bg-white">
      <CardHeader>
        <h2 className="text-xl font-semibold text-dara-navy">Upcoming Sessions</h2>
        <p className="text-sm text-gray-500">View and manage your scheduled sessions</p>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Loading sessions...</p>
            ) : upcomingSessions.length === 0 ? (
              <EmptySchedule />
            ) : (
              upcomingSessions.map((session) => (
                <Card 
                  key={session.id} 
                  className="p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-dara-navy">
                        Coaching Session with Dara
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>
                          {formatDateTime(session.scheduled_for)}
                          {userProfile?.timezone && ` (${userProfile.timezone})`}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(session.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};