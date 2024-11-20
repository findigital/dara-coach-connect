import { Card } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

interface TodosCardProps {
  pendingActionItems: number;
  onClick: () => void;
}

export const TodosCard = ({ pendingActionItems, onClick }: TodosCardProps) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card className="p-6 card-hover h-[250px] cursor-pointer">
        <div className="flex flex-col h-full">
          <div className="bg-dara-yellow rounded-full p-3 w-fit">
            <ClipboardList className="h-6 w-6 text-dara-navy" />
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold mb-2 text-dara-navy">
              {pendingActionItems} {pendingActionItems === 1 ? 'To-do' : 'To-dos'}
            </h2>
            <p className="text-gray-600">Your session notes →</p>
          </div>
        </div>
      </Card>
    </div>
  );
};