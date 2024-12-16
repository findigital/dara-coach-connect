import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface NavigationFooterProps {
  notificationCount: number;
}

export const NavigationFooter = ({ notificationCount }: NavigationFooterProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-center justify-between">
        <Link to="/notifications">
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              "relative",
              location.pathname === "/notifications" && "bg-dara-yellow/10 text-dara-navy"
            )}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};