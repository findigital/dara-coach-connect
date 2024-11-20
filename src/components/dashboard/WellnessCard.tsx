import { Card } from "@/components/ui/card";
import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

export const WellnessCard = () => {
  return (
    <Link to="/wellness">
      <Card className="p-6 card-hover h-[200px] cursor-pointer">
        <div className="flex flex-col h-full">
          <div className="bg-dara-yellow rounded-full p-3 w-fit">
            <Compass className="h-6 w-6 text-dara-navy" />
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2 text-dara-navy">Find a Wellness Program</h2>
            <p className="text-gray-600">Search for Wellness Programs →</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};