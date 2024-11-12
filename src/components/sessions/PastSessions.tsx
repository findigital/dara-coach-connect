import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const PastSessions = () => {
  return (
    <div className="h-full bg-dara-navy">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-white px-2">Past Sessions</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {[1, 2, 3, 4, 5].map((session) => (
            <Button
              key={session}
              variant="ghost"
              className="w-full justify-start text-left mb-2 h-auto py-3 text-white hover:text-white hover:bg-white/10"
            >
              <div>
                <div className="font-medium">Coaching Session {session}</div>
                <div className="text-sm text-gray-300">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </Button>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default PastSessions;