import { Heart } from "lucide-react";

export const EmptySchedule = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-fade-in">
      <Heart className="w-12 h-12 text-dara-yellow" />
      <h3 className="text-xl font-semibold text-dara-navy">Start Your Wellness Journey</h3>
      <p className="text-gray-600 max-w-md">
        Schedule regular check-ins with Dara to maintain your self-care routine. 
        These sessions help you stay accountable and make progress towards your wellness goals.
      </p>
    </div>
  );
};