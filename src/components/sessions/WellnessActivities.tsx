import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import MessageList from "./MessageList";
import { MessageCircle, Mic } from "lucide-react";

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
  const [showInputs, setShowInputs] = useState(false);

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

  if (!showInputs) {
    return (
      <div className="h-full bg-gray-50 p-6">
        <Card className="h-full bg-white">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-dara-navy">Speak with Dara</h2>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center flex-col gap-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-dara-navy">Choose Your Conversation Style</h2>
              <p className="text-gray-600 max-w-md">
                Select how you'd like to interact with Dara today
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
              <Button
                onClick={() => setShowInputs(true)}
                className="flex flex-col items-center gap-4 p-8 h-auto bg-white border-2 border-dara-yellow hover:bg-dara-yellow/10 text-dara-navy group relative"
                variant="ghost"
              >
                <div className="flex flex-col items-center gap-4">
                  <MessageCircle className="w-8 h-8" />
                  <div className="space-y-2 text-center max-w-[200px]">
                    <h3 className="font-semibold">Text Chat</h3>
                    <p className="text-sm text-gray-600 whitespace-normal">
                      Type your messages and receive written responses from Dara
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => setShowInputs(true)}
                className="flex flex-col items-center gap-4 p-8 h-auto bg-white border-2 border-dara-yellow hover:bg-dara-yellow/10 text-dara-navy group relative"
                variant="ghost"
              >
                <div className="flex flex-col items-center gap-4">
                  <Mic className="w-8 h-8" />
                  <div className="space-y-2 text-center max-w-[200px]">
                    <h3 className="font-semibold">Voice Chat</h3>
                    <p className="text-sm text-gray-600 whitespace-normal">
                      Have a natural voice conversation with Dara in real-time
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-dara-navy">Speak with Dara</h2>
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