import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface ScheduleCardProps {
  nextSession: {
    scheduled_for: string;
  } | null;
}

export const ScheduleCard = ({ nextSession }: ScheduleCardProps) => {
  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateString));
  };

  return (
    <Link to="/schedule">
      <Card className="p-6 card-hover h-[200px] cursor-pointer">
        <div className="flex flex-col h-full">
          <div className="bg-dara-yellow rounded-full p-3 w-fit">
            <Calendar className="h-6 w-6 text-dara-navy" />
          </div>
          <div className="mt-4">
            {nextSession ? (
              <>
                <h2 className="text-xl font-bold mb-2 text-dara-navy">Next Session</h2>
                <p className="text-gray-600">{formatDateTime(nextSession.scheduled_for)}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2 text-dara-navy">No Sessions Scheduled</h2>
                <p className="text-gray-600">Schedule your next session with Dara →</p>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};