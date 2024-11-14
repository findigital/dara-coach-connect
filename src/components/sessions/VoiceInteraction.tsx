import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

const VoiceInteraction = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white">
        <CardContent className="flex flex-col items-center justify-center h-full space-y-8">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Circular Waveform Animation */}
            <div className="absolute inset-0">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {[...Array(3)].map((_, i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r="50"
                    fill="none"
                    stroke="#FFE135"
                    strokeWidth="2"
                    className="transform origin-center animate-ripple"
                    style={{
                      animationDelay: `${i * 0.5}s`,
                      opacity: isActive ? 0.5 : 0.3,
                    }}
                  />
                ))}
                {/* Dots Pattern */}
                {[...Array(12)].map((_, i) => (
                  <circle
                    key={`dot-${i}`}
                    cx={100 + Math.cos((i * Math.PI * 2) / 12) * 70}
                    cy={100 + Math.sin((i * Math.PI * 2) / 12) * 70}
                    r="3"
                    fill="#1E3D59"
                    className="transform origin-center animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </svg>
            </div>
            
            {/* Center Mic Icon */}
            <div className="relative z-10 bg-white rounded-full p-6 shadow-lg">
              <Mic className="h-16 w-16 text-dara-navy" />
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="text-lg text-dara-navy font-medium">
              {isActive ? "Listening..." : "Ready to start"}
            </div>
            <Button 
              variant="outline" 
              size="lg"
              className="mt-4 border-2 border-dara-yellow text-dara-navy hover:bg-dara-yellow/10"
              onClick={() => setIsActive(!isActive)}
            >
              Start Call
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;