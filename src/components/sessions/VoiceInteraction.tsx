import { Mic, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const VoiceInteraction = () => {
  return (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-dara-navy mb-2">AI Coach Session</h2>
        <Badge variant="secondary" className="text-sm">
          Active Session
        </Badge>
      </div>

      <Card className="flex-1 flex items-center justify-center bg-gray-50/50">
        <CardContent className="flex flex-col items-center justify-center w-full">
          <div className="relative w-48 h-48 mb-8">
            <div className="absolute inset-0 bg-dara-yellow/10 rounded-full animate-ping" />
            <div className="absolute inset-4 bg-dara-yellow/20 rounded-full animate-ping animation-delay-150" />
            <div className="absolute inset-8 bg-dara-yellow/30 rounded-full animate-ping animation-delay-300" />
            <Button
              variant="outline"
              size="icon"
              className="absolute inset-0 w-full h-full rounded-full border-4 border-dara-navy hover:bg-dara-yellow/10 transition-all duration-300"
            >
              <Mic className="h-12 w-12 text-dara-navy" />
            </Button>
          </div>
          <p className="text-dara-navy text-lg font-medium">Tap to start speaking</p>
          <p className="text-gray-500 text-sm mt-2">Your AI coach is ready to listen</p>
          
          <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>Voice recognition active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;