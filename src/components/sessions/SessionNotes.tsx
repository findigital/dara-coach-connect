import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

const SessionNotes = () => {
  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-dara-navy mb-4">Session Notes</h2>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your notes here..."
              className="min-h-[150px] bg-white"
            />
            <Button className="w-full bg-dara-yellow text-dara-navy hover:bg-dara-yellow/90">
              Save Notes
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="space-y-4">
            {[
              "That was a great point about active listening",
              "The importance of body language",
              "Key takeaway: Practice daily mindfulness",
            ].map((note, index) => (
              <Card key={index} className="p-4 bg-white">
                <p className="text-gray-800">{note}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date().toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SessionNotes;