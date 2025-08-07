import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import MessageList from "./MessageList";
import { Loader2 } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

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
  const [isExpanded, setIsExpanded] = useState<string>("search-form");

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
      setIsExpanded(""); // Close the accordion when searching
      
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
      setIsExpanded("search-form"); // Reopen the form on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-4 lg:p-6">
      <Card className="h-full bg-white">
        <CardHeader className="space-y-1">
          <h2 className="text-xl lg:text-2xl font-semibold text-dara-navy">Wellness Activities</h2>
          <p className="text-sm text-gray-500">Find wellness activities in your area</p>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6">
          <Accordion 
            type="single" 
            collapsible 
            value={isExpanded}
            onValueChange={setIsExpanded}
          >
            <AccordionItem value="search-form" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2 hover:bg-gray-50 rounded-lg">
                <span className="text-base font-medium">Search for Wellness Activities</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
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
                    className="w-full bg-dara-yellow hover:bg-dara-yellow/90 text-dara-navy gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? "Finding recommendations..." : "Get Wellness Recommendations"}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex-1 overflow-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-dara-yellow" />
                <p className="text-sm text-gray-600">Searching for wellness activities...</p>
              </div>
            )}
            {!isLoading && <MessageList messages={messages} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessActivities;