import React, { useState, useEffect } from 'react';

interface CallTimerProps {
  isActive: boolean;
  onReset?: () => void;
}

const CallTimer = ({ isActive, onReset }: CallTimerProps) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setTime(0);
      if (onReset) onReset();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onReset]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center mb-4">
      <p className="text-sm text-gray-600">
        {isActive ? 'On call with Dara' : ''}
      </p>
      {isActive && (
        <p className="text-2xl font-semibold">{formatTime(time)}</p>
      )}
    </div>
  );
};

export default CallTimer;