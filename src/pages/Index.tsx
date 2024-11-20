import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Calendar, MessageSquare, Bell, ClipboardList, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";

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

  const getEncouragingText = (count: number) => {
    if (count === 0) return "Start your journey with your first session!";
    if (count === 1) return "Great start! Keep the momentum going!";
    if (count < 5) return "You're building a great habit!";
    return "Amazing dedication! Keep it up!";
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="flex-grow">
          <div className="p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-dara-navy">Hello!</h1>
                  <span role="img" aria-label="waving hand" className="text-3xl wave-animation">👋</span>
                </div>
                <p className="text-gray-600">How are you? Let's start a session.</p>
              </div>
              <Button 
                className="bg-dara-yellow text-dara-navy hover:bg-dara-navy hover:text-white flex items-center gap-2"
                onClick={() => navigate('/sessions')}
              >
                Start Session
                <span className="ml-2">→</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/sessions" className="md:col-span-1">
                <Card className="p-6 card-hover h-[250px] bg-dara-navy text-white cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <MessageSquare className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      <h2 className="text-3xl font-bold mb-2">{sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'}</h2>
                      <p className="text-gray-300">{getEncouragingText(sessionCount)}</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <div onClick={() => navigate('/past-sessions')} className="md:col-span-1 cursor-pointer">
                <Card className="p-6 card-hover h-[250px] cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <ClipboardList className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      <h2 className="text-3xl font-bold mb-2 text-dara-navy">
                        {pendingActionItems} {pendingActionItems === 1 ? 'To-do' : 'To-dos'}
                      </h2>
                      <p className="text-gray-600">Your session notes →</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Link to="/notifications">
                <Card className="p-6 card-hover h-[200px] cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <Bell className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      <h2 className="text-3xl font-bold mb-2 text-dara-navy">1 Notification</h2>
                      <p className="text-gray-600">Stay in contact with Dara →</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link to="/schedule">
                <Card className="p-6 card-hover h-[200px] cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="bg-dara-yellow rounded-full p-3 w-fit">
                      <Calendar className="h-6 w-6 text-dara-navy" />
                    </div>
                    <div className="mt-4">
                      {nextSession ? (
                        <>
                          <h2 className="text-xl font-bold mb-2 text-dara-navy">Next Session</h2>
                          <p className="text-gray-600">{formatDateTime(nextSession.scheduled_for)}</p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-xl font-bold mb-2 text-dara-navy">No Sessions Scheduled</h2>
                          <p className="text-gray-600">Schedule your next session with Dara →</p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>

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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
