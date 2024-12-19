import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NavigationContent } from "./navigation/NavigationContent";
import { useAuth } from "@/components/AuthProvider";

const Navigation = () => {
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
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 p-4 bg-white border-b z-50">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/a79631f1-6aa3-48c0-9452-5c5358ba1d2f.png" 
              alt="dara logo" 
              className="h-6 w-auto"
            />
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavigationContent notificationCount={notificationCount} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r">
        <NavigationContent notificationCount={notificationCount} />
      </nav>
    </>
  );
};

export default Navigation;