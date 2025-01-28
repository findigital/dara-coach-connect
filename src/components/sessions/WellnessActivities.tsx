import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import MessageList from "./MessageList";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WellnessActivities = () => {
  const { toast } = useToast();
  const [zipCode, setZipCode] = useState("");
  const [preferences, setPreferences] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleGetRecommendations = async () => {
    if (!zipCode.trim()) {
      toast({
        title: "Please enter a ZIP code",
        description: "We need your location to find wellness activities near you.",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user message to the chat
      const userMessage: Message = {
        role: 'user',
        content: `Find wellness activities near ${zipCode}${preferences ? ` with these preferences: ${preferences}` : ''}`
      };
      setMessages(prev => [...prev, userMessage]);

      const { data, error } = await supabase.functions.invoke('get-wellness-recommendations', {
        body: { zipCode, preferences }
      });

      if (error) throw error;

      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        toast({
          title: "Recommendations found!",
          description: "We've found some wellness activities near you.",
        });
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get wellness recommendations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-dara-navy">Wellness Activities</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Your Location</h3>
              <Input
                placeholder="Enter ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="focus-visible:ring-dara-yellow"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Wellness Preferences (Optional)</h3>
              <Textarea
                placeholder="E.g., 'Looking for yoga studios and meditation centers' or 'Interested in outdoor fitness activities'"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="min-h-[100px] focus-visible:ring-dara-yellow"
              />
            </div>

            <Button 
              onClick={handleGetRecommendations}
              disabled={isLoading || !zipCode.trim()}
              className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-dara-navy gap-2"
            >
              {isLoading ? "Finding recommendations..." : "Get Wellness Recommendations"}
            </Button>
          </div>

          <div className="flex-1">
            <MessageList messages={messages} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessActivities;