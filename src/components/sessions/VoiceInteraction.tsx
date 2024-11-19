import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VoiceVisualizer from "./VoiceVisualizer";
import CallTimer from "./CallTimer";
import { playAudioResponse } from "./utils/audioUtils";
import AudioControls from "./AudioControls";
import { AudioProcessor } from "./AudioProcessor";

const VoiceInteraction = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [callStatus, setCallStatus] = useState<'available' | 'on-call' | 'ended'>('available');
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      audioProcessorRef.current?.cleanup();
      audioContextRef.current?.close();
    };
  }, []);

  const processAudioData = async (audioChunks: Blob[]) => {
    if (audioChunks.length === 0) return;
    
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(audioBlob);
    });

    try {
      const { data, error } = await supabase.functions.invoke('realtime-chat', {
        body: { audio: base64Audio },
      });

      if (error) throw error;

      if (data.reply) {
        if (data.audioResponse) {
          const audio = new Audio(data.audioResponse);
          await audio.play();
        }
        if (data.transcription) {
          console.log('Transcription:', data.transcription);
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error("Failed to process audio. Please try again.");
    }
  };

  const startCall = async () => {
    if (!audioProcessorRef.current) {
      audioProcessorRef.current = new AudioProcessor(processAudioData);
      const initialized = await audioProcessorRef.current.initialize();
      if (!initialized) return;
    }

    setCallStatus('on-call');
    setIsRecording(true);
    audioProcessorRef.current.startRecording();
  };

  const endCall = () => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.stopRecording();
    }
    setIsRecording(false);
    setCallStatus('ended');
  };

  const resetCall = () => {
    setCallStatus('available');
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <Card className="h-full bg-white flex flex-col">
        <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4 pt-6">
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