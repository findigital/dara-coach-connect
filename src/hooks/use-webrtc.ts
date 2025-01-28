import { useState, useRef, useEffect } from "react";
import { Tool } from "@/lib/tools";
import { AudioRecorder } from "@/utils/audioRecorder";
import { setupAudioVisualization, getVolume } from "@/utils/audioVisualization";
import { useWebRTCConnection } from "./use-webrtc-connection";

const useWebRTCAudioSession = (voice: string, tools?: Tool[]) => {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [currentVolume, setCurrentVolume] = useState(0);
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const functionRegistry = useRef<Record<string, Function>>({});

  const handleMessage = async (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'response.function_call_arguments.done') {
        const fn = functionRegistry.current[msg.name];
        if (fn) {
          const args = JSON.parse(msg.arguments);
          const result = await fn(args);

          const response = {
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: msg.call_id,
              output: JSON.stringify(result)
            }
          };

          dataChannel?.send(JSON.stringify(response));
        }
      }
      setMsgs(prevMsgs => [...prevMsgs, msg]);
      return msg;
    } catch (error) {
      console.error('Error handling data channel message:', error);
    }
  };

  const {
    status,
    setStatus,
    isSessionActive,
    startConnection,
    stopConnection,
    dataChannel
  } = useWebRTCConnection(voice, handleMessage);

  const startSession = async () => {
    try {
      const { pc, stream } = await startConnection();
      
      audioStreamRef.current = stream;
      audioContextRef.current = setupAudioVisualization(stream, audioIndicatorRef);

      // Set up audio analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      volumeIntervalRef.current = window.setInterval(() => {
        if (analyserRef.current) {
          const volume = getVolume(analyserRef.current);
          setCurrentVolume(volume);
        }
      }, 100);

      // Start recording
      recorderRef.current = new AudioRecorder((audioData) => {
        if (dataChannel?.readyState === 'open') {
          dataChannel.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: btoa(String.fromCharCode.apply(null, Array.from(audioData)))
          }));
        }
      });
      await recorderRef.current.start();

    } catch (err) {
      console.error('Error starting session:', err);
      setStatus(`Error: ${err}`);
      stopSession();
    }
  };

  const stopSession = () => {
    stopConnection();
    
    recorderRef.current?.stop();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    
    setCurrentVolume(0);
    setMsgs([]);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  const registerFunction = (name: string, fn: Function) => {
    functionRegistry.current[name] = fn;
  };

  const handleStartStopClick = () => {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    startSession,
    stopSession,
    handleStartStopClick,
    registerFunction,
    msgs,
    currentVolume
  };
};

export default useWebRTCAudioSession;