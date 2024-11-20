import React from "react";
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

export const EmptyNotifications = () => (
  <Card className="p-8 text-center">
    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-600">No notifications yet</h3>
    <p className="text-gray-500 mt-2">
      We'll notify you about important updates and reminders here
    </p>
  </Card>
);