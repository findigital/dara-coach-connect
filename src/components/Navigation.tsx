import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Settings, Menu, LayoutDashboard, MessageSquare, Calendar, Compass, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/sessions", label: "Start Session", icon: <MessageSquare className="h-5 w-5" /> },
    { path: "/past-sessions", label: "Past Sessions", icon: <History className="h-5 w-5" /> },
    { path: "/schedule", label: "Schedule", icon: <Calendar className="h-5 w-5" /> },
    { path: "/wellness", label: "Wellness", icon: <Compass className="h-5 w-5" /> },
  ];

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

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/a79631f1-6aa3-48c0-9452-5c5358ba1d2f.png" 
            alt="dara logo" 
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <div className="flex-1 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-link flex items-center space-x-3 px-4 py-3 rounded-lg",
                  isActive && "bg-dara-yellow/10 text-dara-navy border-r-4 border-dara-yellow"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

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
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r">
        <NavigationContent />
      </nav>
    </>
  );
};

export default Navigation;