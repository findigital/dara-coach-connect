import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { SessionsCard } from "@/components/dashboard/SessionsCard";
import { TodosCard } from "@/components/dashboard/TodosCard";
import { NotificationsCard } from "@/components/dashboard/NotificationsCard";
import { ScheduleCard } from "@/components/dashboard/ScheduleCard";
import { WellnessCard } from "@/components/dashboard/WellnessCard";

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [sessionCount, setSessionCount] = useState(0);
  const [pendingActionItems, setPendingActionItems] = useState(0);

  // Fetch next scheduled session
  const { data: nextSession } = useQuery({
    queryKey: ['nextScheduledSession'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data } = await supabase
        .from('scheduled_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(1)
        .single();
      
      return data;
    },
    enabled: !!session?.user?.id
  });

  useEffect(() => {
    const fetchSessionCount = async () => {
      if (!session?.user?.id) return;
      
      const { count, error } = await supabase
        .from('coaching_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Error fetching session count:', error);
        return;
      }
      
      setSessionCount(count || 0);
    };

    const fetchPendingActionItems = async () => {
      if (!session?.user?.id) return;

      const { data: sessions } = await supabase
        .from('coaching_sessions')
        .select('id')
        .eq('user_id', session.user.id);

      if (!sessions?.length) return;

      const sessionIds = sessions.map(s => s.id);
      
      const { count, error } = await supabase
        .from('action_items')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds)
        .eq('completed', false);

      if (error) {
        console.error('Error fetching pending action items:', error);
        return;
      }

      setPendingActionItems(count || 0);
    };

    fetchSessionCount();
    fetchPendingActionItems();
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="flex-grow">
          <div className="p-8 pt-20 lg:pt-8">
            <WelcomeHeader />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SessionsCard sessionCount={sessionCount} />
              <TodosCard 
                pendingActionItems={pendingActionItems} 
                onClick={() => navigate('/past-sessions')} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <NotificationsCard />
              <ScheduleCard nextSession={nextSession} />
              <WellnessCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;