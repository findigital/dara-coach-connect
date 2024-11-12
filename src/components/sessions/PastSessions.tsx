import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

const PastSessions = () => {
  return (
    <div className="h-full bg-gray-50">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-dara-navy px-2">Past Sessions</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {[1, 2, 3, 4, 5].map((session) => (
            <Card key={session} className="mb-3 hover:bg-gray-100 transition-colors cursor-pointer">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-dara-navy">
                      Coaching Session {session}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="sr-only">View session {session}</span>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default PastSessions;