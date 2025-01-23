import { useState, useEffect } from 'react';

const useWebRTCAudioSession = (mode: string) => {
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleStartStopClick = () => {
    setIsSessionActive(!isSessionActive);
  };

  useEffect(() => {
    if (isSessionActive) {
      // Simulate volume changes when session is active
      const interval = setInterval(() => {
        setCurrentVolume(Math.random());
      }, 100);

      return () => clearInterval(interval);
    } else {
      setCurrentVolume(0);
    }
  }, [isSessionActive]);

  return {
    currentVolume,
    isSessionActive,
    handleStartStopClick,
  };
};

export default useWebRTCAudioSession;