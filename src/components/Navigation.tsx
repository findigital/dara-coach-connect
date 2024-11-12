import { Link } from "react-router-dom";
import { Bell, Settings, Menu, LayoutDashboard, MessageSquare, Calendar, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navigation = () => {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/sessions", label: "Session Notes", icon: <MessageSquare className="h-5 w-5" /> },
    { path: "/schedule", label: "Schedule", icon: <Calendar className="h-5 w-5" /> },
    { path: "/wellness", label: "Wellness", icon: <Compass className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center">
            <span className="logo text-2xl">dara</span>
          </Link>
        </div>

        <div className="flex-1 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;