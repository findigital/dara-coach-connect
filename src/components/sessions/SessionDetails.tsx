import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session, ActionItem } from "@/types/session";

interface SessionDetailsProps {
  session: Session;
  actionItems: ActionItem[];
  onActionItemToggle: (actionItemId: string, completed: boolean) => void;
}

export const SessionDetails = ({ session, actionItems, onActionItemToggle }: SessionDetailsProps) => {
  const handleDeleteActionItem = async (actionItemId: string) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', actionItemId);

      if (error) throw error;

      // Update local state through parent component
      const updatedActionItems = actionItems.filter(item => item.id !== actionItemId);
      toast.success("Action item deleted successfully");
    } catch (error) {
      console.error('Error deleting action item:', error);
      toast.error("Failed to delete action item");
    }
  };

  return (
    <Card className="lg:h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dara-navy">{session.title}</h3>
          <span className="text-sm text-gray-500">
            {new Date(session.started_at).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-dara-navy mb-2">Summary</h4>
              <p className="text-gray-600">{session.summary || "Generating summary..."}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-dara-navy">Action Items</h4>
              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group relative"
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={(checked) => onActionItemToggle(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={item.id}
                      className={`text-gray-700 cursor-pointer flex-grow ${
                        item.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {item.content}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 hover:bg-red-100 hover:text-red-600"
                      onClick={() => handleDeleteActionItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};