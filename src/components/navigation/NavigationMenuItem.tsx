import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavigationMenuItemProps {
  path: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
}

export const NavigationMenuItem = ({ path, label, icon: Icon, isActive }: NavigationMenuItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "nav-link flex items-center space-x-3 px-4 py-3 rounded-lg",
        isActive && "bg-dara-yellow/10 text-dara-navy border-r-4 border-dara-yellow"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};