import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session, ActionItem } from "@/types/session";
import { useState } from "react";

interface SessionDetailsProps {
  session: Session;
  actionItems: ActionItem[];
  onActionItemToggle: (actionItemId: string, completed: boolean) => void;
  onActionItemDelete: (actionItemId: string) => void;
  onActionItemEdit: (actionItemId: string, newContent: string) => void;
}

export const SessionDetails = ({ 
  session, 
  actionItems, 
  onActionItemToggle,
  onActionItemDelete,
  onActionItemEdit
}: SessionDetailsProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleDeleteActionItem = async (actionItemId: string) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', actionItemId);

      if (error) throw error;

      onActionItemDelete(actionItemId);
      toast.success("Action item deleted successfully");
    } catch (error) {
      console.error('Error deleting action item:', error);
      toast.error("Failed to delete action item");
    }
  };

  const startEditing = (item: ActionItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleEditActionItem = async (actionItemId: string) => {
    if (!editContent.trim()) {
      toast.error("Action item cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from('action_items')
        .update({ content: editContent.trim() })
        .eq('id', actionItemId);

      if (error) throw error;

      onActionItemEdit(actionItemId, editContent.trim());
      setEditingId(null);
      setEditContent("");
      toast.success("Action item updated successfully");
    } catch (error) {
      console.error('Error updating action item:', error);
      toast.error("Failed to update action item");
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dara-navy">{session.title}</h3>
          <span className="text-sm text-gray-500">
            {new Date(session.started_at).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-dara-navy mb-2">Summary</h4>
              <p className="text-gray-600">{session.summary || "Generating summary..."}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-dara-navy">Action Items</h4>
              <div className="space-y-2">
                {actionItems.length === 0 ? (
                  <p className="text-gray-500">Generating action items...</p>
                ) : (
                  actionItems.map((item) => (
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
                      {editingId === item.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditActionItem(item.id)}
                            className="hover:bg-green-100 hover:text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <label
                            htmlFor={item.id}
                            className={`text-gray-700 cursor-pointer flex-grow pr-12 ${
                              item.completed ? "line-through text-gray-400" : ""
                            }`}
                          >
                            {item.content}
                          </label>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-blue-100 hover:text-blue-600"
                              onClick={() => startEditing(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-red-100 hover:text-red-600"
                              onClick={() => handleDeleteActionItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};