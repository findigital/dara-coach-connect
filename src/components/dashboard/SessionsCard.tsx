import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionsCardProps {
  sessionCount: number;
}

export const SessionsCard = ({ sessionCount }: SessionsCardProps) => {
  const getEncouragingText = (count: number) => {
    if (count === 0) return "Start your journey with your first session!";
    if (count === 1) return "Great start! Keep the momentum going!";
    if (count < 5) return "You're building a great habit!";
    return "Amazing dedication! Keep it up!";
  };

  return (
    <Link to="/sessions">
      <Card className="p-6 card-hover h-[250px] bg-dara-navy text-white cursor-pointer">
        <div className="flex flex-col h-full">
          <div className="bg-dara-yellow rounded-full p-3 w-fit">
            <MessageSquare className="h-6 w-6 text-dara-navy" />
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold mb-2">{sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'}</h2>
            <p className="text-gray-300">{getEncouragingText(sessionCount)}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};