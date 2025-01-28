import { CardContent } from "@/components/ui/card";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SessionContentProps {
  currentSessionId: string | null;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  onSendMessage: (content: string) => void;
  startSession: () => void;
}

const SessionContent = ({
  currentSessionId,
  messages,
  input,
  setInput,
  isLoading,
  isActive,
  setIsActive,
  onSendMessage,
  startSession,
}: SessionContentProps) => {
  const { toast } = useToast();
  const [zipCode, setZipCode] = useState("");
  const [preferences, setPreferences] = useState("");

  const handleGetRecommendations = async () => {
    if (!zipCode.trim()) {
      toast({
        title: "Please enter a ZIP code",
        description: "We need your location to find wellness activities near you.",
      });
      return;
    }

    try {
      const userMessage = `Find wellness activities near ${zipCode}${preferences ? ` with these preferences: ${preferences}` : ''}`;
      onSendMessage(userMessage);

      const { data, error } = await supabase.functions.invoke('get-wellness-recommendations', {
        body: { zipCode, preferences }
      });

      if (error) throw error;

      if (data.choices && data.choices[0]?.message?.content) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        // Note: onSendMessage is used only for user messages, we'd need to add this message differently
        // This might require updating the parent component to handle assistant messages
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get wellness recommendations. Please try again.",
      });
    }
  };

  if (!currentSessionId) {
    return (
      <CardContent className="flex-1 flex flex-col space-y-6">
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
            className="w-full bg-dara-yellow hover:bg-dara-yellow/90 text-dara-navy gap-2"
          >
            Get Wellness Recommendations
          </Button>
        </div>

        <div className="flex-1">
          <MessageList messages={messages} />
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
      <MessageList messages={messages} />
      <MessageInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        isActive={isActive}
        setIsActive={setIsActive}
        onSendMessage={onSendMessage}
      />
    </CardContent>
  );
};

export default SessionContent;