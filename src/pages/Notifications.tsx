import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Bell, Calendar, Mail, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";

const NotificationCard = ({ icon: Icon, title, description, timestamp }: {
  icon: any;
  title: string;
  description: string;
  timestamp: string;
}) => (
  <Card className="p-4 mb-4 hover:bg-gray-50 transition-colors cursor-pointer">
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-dara-yellow/10 rounded-full">
        <Icon className="h-5 w-5 text-dara-navy" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-dara-navy">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
        <p className="text-gray-400 text-xs mt-2">{timestamp}</p>
      </div>
    </div>
  </Card>
);

const Notifications = () => {
  const { session } = useAuth();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      // Fetch sessions for summary notifications
      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('started_at', { ascending: false })
        .limit(5);

      // Fetch scheduled sessions for reminder notifications
      const { data: scheduledSessions } = await supabase
        .from('scheduled_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(5);

      const notifications = [];

      // Add session summary notifications
      sessions?.forEach(session => {
        if (session.summary) {
          notifications.push({
            id: `summary-${session.id}`,
            type: 'summary',
            icon: FileText,
            title: 'Session Summary Available',
            description: `Your session summary has been generated and is ready to view.`,
            timestamp: new Date(session.ended_at || session.started_at).toLocaleString(),
          });
        }
      });

      // Add scheduled session notifications
      scheduledSessions?.forEach(scheduled => {
        notifications.push({
          id: `reminder-${scheduled.id}`,
          type: 'reminder',
          icon: Calendar,
          title: 'Upcoming Session Reminder',
          description: `You have a session scheduled for ${new Date(scheduled.scheduled_for).toLocaleString()}`,
          timestamp: new Date(scheduled.created_at || '').toLocaleString(),
        });

        notifications.push({
          id: `email-${scheduled.id}`,
          type: 'email',
          icon: Mail,
          title: 'Session Confirmation Email',
          description: 'Your session confirmation email has been sent.',
          timestamp: new Date(scheduled.created_at || '').toLocaleString(),
        });
      });

      return notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    enabled: !!session?.user?.id,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="bg-white border-b">
            <div className="container mx-auto py-4">
              <h1 className="text-2xl font-semibold text-dara-navy">Notifications</h1>
            </div>
          </div>
          <div className="container mx-auto p-6">
            <ScrollArea className="h-[calc(100vh-12rem)] rounded-md">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : notifications?.length === 0 ? (
                <Card className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600">No notifications yet</h3>
                  <p className="text-gray-500 mt-2">
                    We'll notify you about important updates and reminders here
                  </p>
                </Card>
              ) : (
                notifications?.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    icon={notification.icon}
                    title={notification.title}
                    description={notification.description}
                    timestamp={notification.timestamp}
                  />
                ))
              )}
            </ScrollArea>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;