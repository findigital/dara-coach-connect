import { useCallback } from 'react';
import { useWebRTCConnection } from './use-webrtc-connection';
import { WebRTCStatus } from '@/types/webrtc';

const useWebRTCAudioSession = (mode: 'alloy'): WebRTCStatus & { handleStartStopClick: () => Promise<void> } => {
  const {
    status,
    setStatus,
    isSessionActive,
    startConnection,
    stopConnection,
    currentVolume
  } = useWebRTCConnection();

  const handleStartStopClick = useCallback(async () => {
    if (isSessionActive) {
      stopConnection();
    } else {
      await startConnection();
    }
  }, [isSessionActive, startConnection, stopConnection]);

  return {
    status,
    setStatus,
    isSessionActive,
    currentVolume,
    handleStartStopClick
  };
};

export default useWebRTCAudioSession;