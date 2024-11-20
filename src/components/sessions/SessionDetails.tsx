import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import type { Session, ActionItem } from "@/types/session";

interface SessionDetailsProps {
  session: Session;
  actionItems: ActionItem[];
  onActionItemToggle: (actionItemId: string, completed: boolean) => void;
}

export const SessionDetails = ({ session, actionItems, onActionItemToggle }: SessionDetailsProps) => {
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
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={(checked) => onActionItemToggle(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={item.id}
                      className={`text-gray-700 cursor-pointer ${
                        item.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {item.content}
                    </label>
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