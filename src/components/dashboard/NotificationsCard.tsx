import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const NotificationsCard = () => {
  const { session } = useAuth();
  
  const { data: notificationCount = 0 } = useQuery({
    queryKey: ['notificationCount', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      const [{ data: unreadSessions }, { data: unreadScheduled }] = await Promise.all([
        supabase
          .from('coaching_sessions')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('is_read', false),
        supabase
          .from('scheduled_sessions')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('is_read', false)
      ]);
      
      return (unreadSessions?.length || 0) + (unreadScheduled?.length || 0);
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <Link to="/notifications">
      <Card className="p-6 card-hover h-[200px] cursor-pointer">
        <div className="flex flex-col h-full">
          <div className="bg-dara-yellow rounded-full p-3 w-fit">
            <Bell className="h-6 w-6 text-dara-navy" />
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold mb-2 text-dara-navy">
              {notificationCount} {notificationCount === 1 ? 'Notification' : 'Notifications'}
            </h2>
            <p className="text-gray-600">Stay in contact with Dara →</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};