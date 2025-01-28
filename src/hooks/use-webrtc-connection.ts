import { useState, useCallback, useRef } from 'react';
import { WebRTCConnection } from '@/types/webrtc';
import { useVolumeMonitor } from './use-volume-monitor';

export const useWebRTCConnection = (): WebRTCConnection => {
  const [status, setStatus] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { currentVolume, handleVolumeChange } = useVolumeMonitor();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startConnection = useCallback(async () => {
    try {
      setStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      
      audioContextRef.current = audioContext;
      sourceNodeRef.current = source;

      handleVolumeChange(audioContext, source);
      setIsSessionActive(true);
      setStatus('Connected');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('Error accessing microphone');
      setIsSessionActive(false);
    }
  }, [handleVolumeChange]);

  const stopConnection = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    setIsSessionActive(false);
    setStatus('Disconnected');
  }, []);

  return {
    status,
    setStatus,
    isSessionActive,
    startConnection,
    stopConnection,
    currentVolume
  };
};