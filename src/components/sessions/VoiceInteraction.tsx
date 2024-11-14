import { Mic, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const VoiceInteraction = () => {
  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-dara-navy">Voice Interaction</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] space-y-4">
            <div className="relative">
              <Activity className="h-24 w-24 text-dara-yellow animate-pulse" />
              <Mic className="h-12 w-12 text-dara-navy absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <Button 
              variant="outline" 
              size="lg"
              className="mt-4 border-2 border-dara-yellow text-dara-navy hover:bg-dara-yellow/10"
            >
              Start Recording
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;