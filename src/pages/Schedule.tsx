import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { ScheduledSessionsList } from "@/components/schedule/ScheduledSessionsList";

const Schedule = () => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", 
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch scheduled sessions
  const { data: scheduledSessions = [], isLoading } = useQuery({
    queryKey: ['scheduledSessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_sessions')
        .select('*')
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Schedule new session mutation
  const scheduleMutation = useMutation({
    mutationFn: async ({ scheduledFor }: { scheduledFor: Date }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('scheduled_sessions')
        .insert({
          scheduled_for: scheduledFor.toISOString(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email
      await supabase.functions.invoke('send-schedule-email', {
        body: {
          userId: user.id,
          scheduledFor: scheduledFor.toISOString(),
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledSessions'] });
      toast({
        title: "Session Scheduled",
        description: `Your session has been scheduled for ${format(date!, "PPP")} at ${time}. Check your email for confirmation!`,
      });
      setDate(undefined);
      setTime(undefined);
    },
    onError: (error) => {
      console.error('Scheduling error:', error);
      toast({
        title: "Error",
        description: "Failed to schedule session. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledSessions'] });
      toast({
        title: "Session Cancelled",
        description: "Your session has been cancelled successfully.",
      });
    }
  });

  const handleSchedule = () => {
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for your session.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const [hours, minutes] = time.split(':');
    const isPM = time.includes('PM');
    const scheduledFor = new Date(date);
    scheduledFor.setHours(
      isPM ? parseInt(hours) + 12 : parseInt(hours),
      parseInt(minutes),
      0
    );

    scheduleMutation.mutate({ scheduledFor });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="bg-white border-b">
            <div className="container mx-auto py-4">
              <h1 className="text-2xl font-semibold text-dara-navy">Schedule</h1>
            </div>
          </div>
          <div className="container mx-auto p-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ScheduleForm
                date={date}
                time={time}
                timeSlots={timeSlots}
                setDate={setDate}
                setTime={setTime}
                handleSchedule={handleSchedule}
              />
              <ScheduledSessionsList
                sessions={scheduledSessions}
                isLoading={isLoading}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Schedule;