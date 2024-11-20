import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Calendar as CalendarIcon } from "lucide-react";
import { EmptySchedule } from "./EmptySchedule";
import { Tables } from "@/integrations/supabase/types";

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
            ) : sessions.length === 0 ? (
              <EmptySchedule />
            ) : (
              sessions.map((session) => (
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
                          {format(new Date(session.scheduled_for), "PPP 'at' h:mm a")}
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