import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, History, Calendar, Compass } from "lucide-react";
import { NavigationMenuItem } from "./NavigationMenuItem";
import { NavigationFooter } from "./NavigationFooter";

interface NavigationContentProps {
  notificationCount: number;
}

export const NavigationContent = ({ notificationCount }: NavigationContentProps) => {
  const location = useLocation();
  
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/sessions", label: "Start Session", icon: MessageSquare },
    { path: "/past-sessions", label: "Past Sessions", icon: History },
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/wellness", label: "Wellness", icon: Compass },
  ];

  return (
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
          {menuItems.map((item) => (
            <NavigationMenuItem
              key={item.path}
              path={item.path}
              label={item.label}
              icon={item.icon}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>
      </div>

      <NavigationFooter notificationCount={notificationCount} />
    </div>
  );
};