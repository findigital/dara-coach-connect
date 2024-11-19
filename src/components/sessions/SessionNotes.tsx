import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Clock, Save, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const SessionNotes = () => {
  const { toast } = useToast();
  const [zipCode, setZipCode] = useState("");
  const [activities, setActivities] = useState([
    {
      id: 1,
      category: "Yoga",
      location: "Mindful Yoga Studio",
      address: "123 Wellness Ave",
      distance: "0.5 miles",
      timestamp: new Date().toLocaleString()
    },
    {
      id: 2,
      category: "Meditation",
      location: "Zen Meditation Center",
      address: "456 Peace Street",
      distance: "1.2 miles",
      timestamp: new Date().toLocaleString()
    },
    {
      id: 3,
      category: "Fitness",
      location: "Community Wellness Center",
      address: "789 Health Blvd",
      distance: "2.0 miles",
      timestamp: new Date().toLocaleString()
    }
  ]);

  const handleSaveLocation = () => {
    toast({
      title: "Location saved",
      description: "Your wellness preferences and location have been saved.",
    });
  };

  const handleDeleteActivity = (id: number) => {
    setActivities(activities.filter(activity => activity.id !== id));
    toast({
      title: "Activity removed",
      description: "The wellness activity has been removed from your list.",
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Location</label>
              <Input
                placeholder="Enter your zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="focus-visible:ring-dara-yellow"
              />
            </div>
            <Textarea
              placeholder="Add notes about your wellness preferences..."
              className="min-h-[100px] resize-none focus-visible:ring-dara-yellow"
            />
            <Button 
              onClick={handleSaveLocation}
              className="w-full bg-dara-yellow text-dara-navy hover:bg-dara-yellow/90 gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium text-dara-navy mb-4">Recommended Wellness Activities</h3>
            <ScrollArea className="h-[calc(100vh-26rem)]">
              <div className="space-y-4 pr-4">
                {activities.map((activity) => (
                  <Card 
                    key={activity.id} 
                    className="group hover:-translate-y-1 transition-all duration-200"
                  >
                    <CardContent className="p-4 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-dara-navy">{activity.category}</h4>
                          <p className="text-gray-600 mt-1">{activity.location}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{activity.address}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <span className="text-dara-navy font-medium">({activity.distance})</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                          onClick={() => handleDeleteActivity(activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

export default SessionNotes;