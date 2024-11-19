import { Volume2, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VoiceVisualizer from "./VoiceVisualizer";
import CallTimer from "./CallTimer";
import { initializeAudioContext, playAudioResponse } from "./utils/audioUtils";

const SILENCE_THRESHOLD = -50; // dB
const SILENCE_DURATION = 1000; // ms

const VoiceInteraction = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [callStatus, setCallStatus] = useState<'available' | 'on-call' | 'ended'>('available');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    audioContextRef.current = initializeAudioContext();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          if (audioContextRef.current) {
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;
            source.connect(analyserRef.current);
          }

          mediaRecorderRef.current = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
          });
          
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorderRef.current.onstop = async () => {
            await processAudioChunk();
          };
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          toast.error("Could not access microphone. Please check permissions.");
        });
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const processAudioChunk = async () => {
    if (processingRef.current || audioChunksRef.current.length === 0) return;
    
    processingRef.current = true;
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      try {
        const { data, error } = await supabase.functions.invoke('realtime-chat', {
          body: { audio: base64Audio },
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }

        if (data.reply) {
          if (data.audioResponse) {
            await playAudioResponse(audioContextRef.current, data.audioResponse);
          }
          if (data.transcription) {
            console.log('Transcription:', data.transcription);
          }
        }
      } catch (error) {
        console.error('Error processing audio:', error);
        toast.error("Failed to process audio. Please try again.");
        endCall();
      }
      
      audioChunksRef.current = [];
      processingRef.current = false;
    };
    
    reader.readAsDataURL(audioBlob);
  };

  const detectSilence = () => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    const rms = Math.sqrt(dataArray.reduce((acc, val) => acc + val * val, 0) / dataArray.length);
    const db = 20 * Math.log10(rms);

    if (db < SILENCE_THRESHOLD) {
      if (silenceStartRef.current === null) {
        silenceStartRef.current = Date.now();
      } else if (Date.now() - silenceStartRef.current > SILENCE_DURATION) {
        processAudioChunk();
        silenceStartRef.current = null;
      }
    } else {
      silenceStartRef.current = null;
    }

    requestAnimationFrame(detectSilence);
  };

  const startCall = () => {
    if (!mediaRecorderRef.current) {
      toast.error("Microphone not initialized");
      return;
    }

    setCallStatus('on-call');
    setIsRecording(true);
    audioChunksRef.current = [];
    mediaRecorderRef.current.start(1000); // Collect data every second
    detectSilence();
  };

  const endCall = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setCallStatus('ended');
    silenceStartRef.current = null;
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

          <div className="flex gap-4">
            {callStatus === 'available' && (
              <Button
                onClick={startCall}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Start a call
              </Button>
            )}

            {callStatus === 'on-call' && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={endCall}
                >
                  <X className="h-5 w-5" />
                </Button>
              </>
            )}

            {callStatus === 'ended' && (
              <Button
                onClick={resetCall}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Start a call
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;