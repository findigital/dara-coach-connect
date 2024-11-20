import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@/types/session";

interface SessionListProps {
  sessions: Session[];
  selectedSessionId: string | null;
  onSessionSelect: (session: Session) => void;
}

export const SessionList = ({ sessions, selectedSessionId, onSessionSelect }: SessionListProps) => {
  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('coaching_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast.success("Session deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error("Failed to delete session");
    }
  };

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
              className={`group relative cursor-pointer transition-all hover:-translate-y-1 duration-200 ${
                selectedSessionId === session.id ? 'bg-dara-yellow/10 border-dara-yellow' : ''
              }`}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div onClick={() => onSessionSelect(session)} className="flex-1">
                    <h3 className="font-semibold text-dara-navy">
                      {session.title || "Coaching Session"}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {new Date(session.started_at).toLocaleDateString()}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Session</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this session? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};