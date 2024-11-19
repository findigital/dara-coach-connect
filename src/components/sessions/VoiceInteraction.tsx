import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import VoiceVisualizer from "./VoiceVisualizer";
import CallTimer from "./CallTimer";
import AudioControls from "./AudioControls";
import {
  LiveKitRoom,
  AudioConference,
  RoomAudioRenderer,
  ControlBar,
  useRoom,
  useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';

const VoiceInteraction = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [callStatus, setCallStatus] = useState<'available' | 'on-call' | 'ended'>('available');
  const [token, setToken] = useState<string | null>(null);

  const startCall = async () => {
    try {
      // In a real app, you would fetch a token from your server
      const demoToken = process.env.VITE_LIVEKIT_TOKEN;
      if (!demoToken) {
        toast.error("LiveKit token not configured");
        return;
      }
      
      setToken(demoToken);
      setCallStatus('on-call');
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error("Failed to start call. Please try again.");
    }
  };

  const endCall = () => {
    setIsRecording(false);
    setCallStatus('ended');
    setToken(null);
  };

  const resetCall = () => {
    setCallStatus('available');
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white flex flex-col">
        <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4 pt-6">
          {token && (
            <LiveKitRoom
              serverUrl={process.env.VITE_LIVEKIT_URL}
              token={token}
              connect={true}
              video={false}
              audio={true}
            >
              <div className="w-full">
                <AudioConference />
                <RoomAudioRenderer />
                <ControlBar />
              </div>
            </LiveKitRoom>
          )}
          
          <VoiceVisualizer isActive={isRecording} />
          
          <div className="text-center mb-4">
            {callStatus === 'available' && (
              <>
                <p className="text-lg mb-2">Dara</p>
                <p className="text-sm text-green-500 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Available
                </p>
              </>
            )}
          </div>

          <CallTimer 
            isActive={callStatus === 'on-call'} 
            onReset={resetCall}
          />

          {callStatus === 'ended' && (
            <p className="text-gray-600 mb-4">Call Ended</p>
          )}

          <AudioControls
            isRecording={isRecording}
            onStartCall={startCall}
            onEndCall={endCall}
            callStatus={callStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;