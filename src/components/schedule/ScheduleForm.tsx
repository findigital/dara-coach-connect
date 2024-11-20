import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ScheduleFormProps {
  date: Date | undefined;
  time: string | undefined;
  timeSlots: string[];
  setDate: (date: Date | undefined) => void;
  setTime: (time: string | undefined) => void;
  handleSchedule: () => void;
}

export const ScheduleForm = ({ 
  date, 
  time, 
  timeSlots, 
  setDate, 
  setTime, 
  handleSchedule 
}: ScheduleFormProps) => {
  return (
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
  );
};