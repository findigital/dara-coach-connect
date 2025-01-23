import { useState, useEffect } from 'react';

const useWebRTCAudioSession = (mode: string) => {
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSessionActive) {
      interval = setInterval(() => {
        // Simulate volume changes for demo
        setCurrentVolume(Math.random());
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSessionActive]);

  const handleStartStopClick = () => {
    setIsSessionActive(!isSessionActive);
  };

  return {
    currentVolume,
    isSessionActive,
    handleStartStopClick,
  };
};

export default useWebRTCAudioSession;