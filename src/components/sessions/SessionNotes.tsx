import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const SessionNotes = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState([
    {
      id: 1,
      text: "That was a great point about active listening",
      timestamp: new Date().toLocaleString()
    },
    {
      id: 2,
      text: "The importance of body language",
      timestamp: new Date().toLocaleString()
    },
    {
      id: 3,
      text: "Key takeaway: Practice daily mindfulness",
      timestamp: new Date().toLocaleString()
    }
  ]);

  const handleSaveNotes = () => {
    toast({
      title: "Notes saved",
      description: "Your session notes have been saved successfully.",
    });
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
    toast({
      title: "Note deleted",
      description: "Your note has been deleted successfully.",
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
                {notes.map((note) => (
                  <Card 
                    key={note.id} 
                    className="group hover:-translate-y-1 transition-all duration-200"
                  >
                    <CardContent className="p-4 relative">
                      <p className="text-gray-800 pr-8">{note.text}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{note.timestamp}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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