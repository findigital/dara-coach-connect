import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Search, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface WellnessLocation {
  id: number;
  name: string;
  category: string;
  address: string;
  distance: string;
}

const WellnessActivities = () => {
  const { toast } = useToast();
  const [zipCode, setZipCode] = useState("");
  const [preferences, setPreferences] = useState("");
  const [locations, setLocations] = useState<WellnessLocation[]>([
    {
      id: 1,
      name: "Peaceful Mind Yoga Studio",
      category: "Yoga",
      address: "123 Wellness Ave",
      distance: "0.5 miles"
    },
    {
      id: 2,
      name: "Mindful Meditation Center",
      category: "Meditation",
      address: "456 Serenity St",
      distance: "1.2 miles"
    },
    {
      id: 3,
      name: "Active Life Fitness",
      category: "Fitness",
      address: "789 Health Blvd",
      distance: "1.8 miles"
    }
  ]);

  const handleSearch = () => {
    toast({
      title: "Searching wellness facilities",
      description: `Finding wellness activities near ${zipCode}`,
    });
  };

  const handleSaveLocation = (locationId: number) => {
    toast({
      title: "Location saved",
      description: "The wellness location has been saved to your favorites.",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences saved",
      description: "Your wellness preferences have been saved successfully.",
    });
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-dara-navy">Wellness Activities</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Your Location</h3>
              <Input
                placeholder="Enter ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="focus-visible:ring-dara-yellow"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Add notes about your wellness preferences...</h3>
              <Textarea
                placeholder="Add notes about your wellness preferences..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="min-h-[100px] focus-visible:ring-dara-yellow"
              />
            </div>

            <Button 
              onClick={handleSavePreferences}
              className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-dara-navy gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Recommended Wellness Activities</h3>
            <ScrollArea className="h-[calc(100vh-32rem)]">
              <div className="space-y-4 pr-4">
                {locations.map((location) => (
                  <Card 
                    key={location.id} 
                    className="group hover:-translate-y-1 transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-dara-navy">{location.category}</h3>
                          <p className="text-gray-600">{location.name}</p>
                          <div className="flex items-center gap-1 text-gray-500 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{location.address}</span>
                          </div>
                          <p className="text-dara-navy mt-1">({location.distance})</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-dara-yellow/20"
                          onClick={() => handleSaveLocation(location.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
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

export default WellnessActivities;