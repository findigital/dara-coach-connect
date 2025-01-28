import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

interface WellnessFormProps {
  setLocalMessages: (updater: (prev: Message[]) => Message[]) => void;
}

const WellnessForm = ({ setLocalMessages }: WellnessFormProps) => {
  const { toast } = useToast();
  const [zipCode, setZipCode] = useState("");
  const [preferences, setPreferences] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accordionValue, setAccordionValue] = useState("preferences");

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
      const userMessage = `Find wellness activities near ${zipCode}${preferences ? ` with these preferences: ${preferences}` : ''}`;
      const newUserMessage: Message = {
        role: 'user',
        content: userMessage
      };
      setLocalMessages(prev => [...prev, newUserMessage]);

      const { data, error } = await supabase.functions.invoke('get-wellness-recommendations', {
        body: { zipCode, preferences }
      });

      if (error) throw error;

      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content,
          citations: data.citations || []
        };
        setLocalMessages(prev => [...prev, assistantMessage]);
        // Collapse the accordion after successful submission
        setAccordionValue("");
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
    <div className="space-y-4">
      <Accordion 
        type="single" 
        collapsible 
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="bg-white rounded-lg"
      >
        <AccordionItem value="preferences" className="border-none">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold">My Selections</span>
              {zipCode && <span className="text-sm text-gray-500">ZIP: {zipCode}</span>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
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
              {isLoading ? "Finding recommendations..." : "Get Wellness Recommendations"}
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default WellnessForm;