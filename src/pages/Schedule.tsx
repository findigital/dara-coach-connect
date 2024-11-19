import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const Schedule = () => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const { toast } = useToast();
  const [scheduledSessions, setScheduledSessions] = useState([
    { id: 1, date: new Date(2024, 2, 20), time: "10:00 AM", title: "Career Planning Session" },
    { id: 2, date: new Date(2024, 2, 25), time: "2:00 PM", title: "Goal Setting Review" },
  ]);

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", 
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  const handleSchedule = () => {
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for your session.",
        variant: "destructive",
      });
      return;
    }

    const newSession = {
      id: Date.now(),
      date: date,
      time: time,
      title: "Coaching Session with Dara",
    };

    setScheduledSessions([...scheduledSessions, newSession]);
    toast({
      title: "Session Scheduled",
      description: `Your session has been scheduled for ${format(date, "PPP")} at ${time}`,
    });
    setDate(undefined);
    setTime(undefined);
  };

  const handleDelete = (id: number) => {
    setScheduledSessions(scheduledSessions.filter(session => session.id !== id));
    toast({
      title: "Session Cancelled",
      description: "Your session has been cancelled successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="container mx-auto p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Schedule New Session */}
              <Card className="lg:h-[calc(100vh-8rem)] flex flex-col bg-white">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-dara-navy">Schedule a Session</h2>
                  <p className="text-sm text-gray-500">Choose your preferred date and time</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-6 flex-1 flex flex-col justify-center items-center">
                    <div className="w-full max-w-[350px] flex items-center justify-center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                    
                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium text-gray-700">Select Time</label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleSchedule}
                      className="w-full bg-dara-yellow text-dara-navy hover:bg-dara-navy hover:text-white"
                    >
                      Schedule Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card className="lg:h-[calc(100vh-8rem)] flex flex-col bg-white">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-dara-navy">Upcoming Sessions</h2>
                  <p className="text-sm text-gray-500">View and manage your scheduled sessions</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <div className="space-y-4">
                      {scheduledSessions.map((session) => (
                        <Card 
                          key={session.id} 
                          className="p-4 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-dara-navy">
                                {session.title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span>
                                  {format(session.date, "PPP")} at {session.time}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(session.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Schedule;