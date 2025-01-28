import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Save, Trash2, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const WellnessNotes = () => {
  const { session } = useAuth();
  const [notes, setNotes] = useState<Array<{
    id: string;
    content: string;
    created_at: string;
  }>>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadNotes();
    }
  }, [session?.user?.id]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('wellness_notes')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error("Failed to load notes");
    }
  };

  const handleSaveNotes = async () => {
    if (!newNote.trim() || !session?.user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('wellness_notes')
        .insert({
          user_id: session.user.id,
          content: newNote.trim()
        });

      if (error) throw error;

      setNewNote("");
      await loadNotes();
      toast.success("Note saved successfully");
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error("Failed to save note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wellness_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-dara-navy">Wellness Notes</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Write your wellness notes here..."
              className="min-h-[150px] resize-none focus-visible:ring-dara-yellow"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Button 
              onClick={handleSaveNotes}
              className="w-full bg-dara-yellow text-dara-navy hover:bg-dara-yellow/90 gap-2"
              disabled={isLoading || !newNote.trim()}
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Notes"}
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium text-dara-navy">Notes History</h3>
              <span className="text-sm bg-dara-yellow/20 text-dara-navy px-2 py-0.5 rounded-full">
                {notes.length}
              </span>
            </div>
            <ScrollArea className="h-[calc(100vh-26rem)]">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <StickyNote className="h-12 w-12 mb-4 text-dara-yellow" />
                  <p className="text-lg font-medium mb-2">No notes yet</p>
                  <p className="text-sm text-center max-w-[280px]">
                    Start taking notes about wellness locations and activities. They'll appear here for you to review later.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {notes.map((note) => (
                    <Card 
                      key={note.id} 
                      className="group hover:-translate-y-1 transition-all duration-200"
                    >
                      <CardContent className="p-4 relative">
                        <p className="text-gray-800 pr-8">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(note.created_at).toLocaleString()}</span>
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
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessNotes;