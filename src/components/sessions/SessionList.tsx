import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays } from "lucide-react";
import type { Session } from "@/types/session";

interface SessionListProps {
  sessions: Session[];
  selectedSessionId: string | null;
  onSessionSelect: (session: Session) => void;
}

export const SessionList = ({ sessions, selectedSessionId, onSessionSelect }: SessionListProps) => {
  return (
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
                selectedSessionId === session.id ? 'bg-dara-yellow/10 border-dara-yellow' : ''
              }`}
              onClick={() => onSessionSelect(session)}
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
  );
};