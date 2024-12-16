import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Bell, Calendar, FileText, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { toast } from "@/components/ui/use-toast";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";

interface Notification {
  id: string;
  type: 'session' | 'scheduled';
  recordId: string;
  icon: typeof Bell | typeof Calendar | typeof FileText;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

const Notifications = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const [{ data: sessions }, { data: scheduledSessions }] = await Promise.all([
        supabase
          .from('coaching_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('started_at', { ascending: false })
          .limit(5),
        supabase
          .from('scheduled_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('scheduled_for', new Date().toISOString())
          .order('scheduled_for', { ascending: true })
          .limit(5)
      ]);

      const notifications: Notification[] = [];

      sessions?.forEach(session => {
        if (session.summary) {
          notifications.push({
            id: `summary-${session.id}`,
            type: 'session',
            recordId: session.id,
            icon: FileText,
            title: 'Session Summary Available',
            description: `Your session summary has been generated and is ready to view.`,
            timestamp: new Date(session.ended_at || session.started_at).toLocaleString(),
            isRead: session.is_read || false,
          });
        }
      });

      scheduledSessions?.forEach(scheduled => {
        notifications.push({
          id: `reminder-${scheduled.id}`,
          type: 'scheduled',
          recordId: scheduled.id,
          icon: Calendar,
          title: 'Upcoming Session Reminder',
          description: `You have a session scheduled for ${new Date(scheduled.scheduled_for).toLocaleString()}`,
          timestamp: new Date(scheduled.created_at || '').toLocaleString(),
          isRead: scheduled.is_read || false,
        });
      });

      return notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    enabled: !!session?.user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'session' | 'scheduled', id: string }) => {
      const table = type === 'session' ? 'coaching_sessions' : 'scheduled_sessions';
      const { error } = await supabase
        .from(table)
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
      toast({
        title: "Notification marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Group notifications by type
      const sessionIds = unreadNotifications
        .filter(n => n.type === 'session')
        .map(n => n.recordId);
      
      const scheduledIds = unreadNotifications
        .filter(n => n.type === 'scheduled')
        .map(n => n.recordId);

      // Update all unread notifications in parallel
      const promises = [];
      
      if (sessionIds.length > 0) {
        promises.push(
          supabase
            .from('coaching_sessions')
            .update({ is_read: true })
            .in('id', sessionIds)
        );
      }
      
      if (scheduledIds.length > 0) {
        promises.push(
          supabase
            .from('scheduled_sessions')
            .update({ is_read: true })
            .in('id', scheduledIds)
        );
      }

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to mark all notifications as read');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
      toast({
        title: "All notifications marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="bg-white border-b">
            <div className="container mx-auto py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-dara-navy">Notifications</h1>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All ({unreadCount})
                  </Button>
                )}
              </div>
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
              ) : notifications.length === 0 ? (
                <EmptyNotifications />
              ) : (
                notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    icon={notification.icon}
                    title={notification.title}
                    description={notification.description}
                    timestamp={notification.timestamp}
                    isRead={notification.isRead}
                    onMarkAsRead={() => markAsReadMutation.mutate({
                      type: notification.type,
                      id: notification.recordId
                    })}
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