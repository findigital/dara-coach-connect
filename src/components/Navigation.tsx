import { Link } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="logo text-2xl">dara</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/dashboard" className="nav-link flex items-center px-1 pt-1">
                Dashboard
              </Link>
              <Link to="/sessions" className="nav-link flex items-center px-1 pt-1">
                Session Notes
              </Link>
              <Link to="/messages" className="nav-link flex items-center px-1 pt-1">
                Messages
              </Link>
              <Link to="/schedule" className="nav-link flex items-center px-1 pt-1">
                Schedule
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
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