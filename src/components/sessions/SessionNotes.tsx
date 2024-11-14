import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SessionNotes = () => {
  const { toast } = useToast();

  const handleSaveNotes = () => {
    toast({
      title: "Notes saved",
      description: "Your session notes have been saved successfully.",
    });
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-dara-navy">Take Notes</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Write your notes here..."
              className="min-h-[150px] resize-none focus-visible:ring-dara-yellow"
            />
            <Button 
              onClick={handleSaveNotes}
              className="w-full bg-dara-yellow text-dara-navy hover:bg-dara-yellow/90 gap-2"
            >
              <Save className="h-4 w-4" />
              Save Notes
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium text-dara-navy mb-4">Session History</h3>
            <ScrollArea className="h-[calc(100vh-26rem)]">
              <div className="space-y-4 pr-4">
                {[
                  "That was a great point about active listening",
                  "The importance of body language",
                  "Key takeaway: Practice daily mindfulness",
                ].map((note, index) => (
                  <Card key={index} className="hover:-translate-y-1 transition-all duration-200">
                    <CardContent className="p-4">
                      <p className="text-gray-800">{note}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{new Date().toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionNotes;