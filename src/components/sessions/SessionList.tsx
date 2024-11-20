import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CalendarDays, Trash2, StickyNote } from "lucide-react";
import type { Session } from "@/types/session";

interface SessionListProps {
  sessions: Session[];
  selectedSessionId: string | null;
  onSessionSelect: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionList = ({ 
  sessions, 
  selectedSessionId, 
  onSessionSelect,
  onDeleteSession 
}: SessionListProps) => {
  return (
    <Card className="lg:h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <h3 className="text-lg font-semibold text-dara-navy">Sessions History</h3>
        <p className="text-sm text-gray-500">Review your previous coaching sessions</p>
      </CardHeader>
      <ScrollArea className="flex-1 px-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <StickyNote className="h-12 w-12 mb-4 text-dara-yellow" />
            <p className="text-lg font-medium mb-2">No sessions yet</p>
            <p className="text-sm text-center max-w-[280px]">
              Your coaching sessions will appear here once you start them.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`group cursor-pointer transition-all hover:-translate-y-1 duration-200 ${
                  selectedSessionId === session.id ? 'bg-dara-yellow/10 border-dara-yellow' : ''
                }`}
                onClick={() => onSessionSelect(session)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-dara-navy">
                        {session.title || "Coaching Session"}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {new Date(session.started_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};