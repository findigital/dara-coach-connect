import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  onMarkAsRead: () => void;
}

export const NotificationCard = ({ 
  icon: Icon, 
  title, 
  description, 
  timestamp,
  isRead,
  onMarkAsRead,
}: NotificationCardProps) => (
  <Card className={cn(
    "p-4 mb-4 hover:bg-gray-50 transition-colors cursor-pointer",
    !isRead && "border-l-4 border-dara-yellow"
  )}>
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-dara-yellow/10 rounded-full">
        <Icon className="h-5 w-5 text-dara-navy" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-dara-navy">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
        <p className="text-gray-400 text-xs mt-2">{timestamp}</p>
      </div>
      {!isRead && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead();
          }}
        >
          Mark as read
        </Button>
      )}
    </div>
  </Card>
);