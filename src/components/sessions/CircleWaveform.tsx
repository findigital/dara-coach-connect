
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import useWebRTCAudioSession from '@/hooks/use-webrtc';

const CircleWaveform: React.FC = () => {
  const { currentVolume, isSessionActive, handleStartStopClick, status } = useWebRTCAudioSession('alloy');
  const [bars, setBars] = useState(Array(40).fill(0));

  useEffect(() => {
    if (isSessionActive) {
      updateBars(currentVolume);
    } else {
      resetBars();
    }
  }, [currentVolume, isSessionActive]);

  const updateBars = (volume: number) => {
    setBars(bars.map(() => Math.random() * volume * 50));
  };

  const resetBars = () => {
    setBars(Array(40).fill(0));
  };

  return (
    <div className='border text-center rounded-2xl w-full max-w-[180px] h-[180px] mx-auto'>
      <div className="flex items-center justify-center h-full relative">
        {status && (
          <div className="absolute top-1 left-0 right-0 text-xs text-gray-500">
            {status}
          </div>
        )}
        {isSessionActive ? 
          <MicOff
            size={20}
            className="text-black dark:text-white"
            onClick={handleStartStopClick}
            style={{ cursor: 'pointer', zIndex: 10 }}
          />
          :
          <Mic
            size={24}
            className="text-black dark:text-white"
            onClick={handleStartStopClick}
            style={{ cursor: 'pointer', zIndex: 10 }}
          />
        }
        <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', top: 0, left: 0 }}>
          {bars.map((height, index) => {
            const angle = (index / bars.length) * 360;
            const radians = (angle * Math.PI) / 180;
            const x1 = 100 + Math.cos(radians) * 40;
            const y1 = 100 + Math.sin(radians) * 40;
            const x2 = 100 + Math.cos(radians) * (70 + height * 0.6);
            const y2 = 100 + Math.sin(radians) * (70 + height * 0.6);

            return (
              <motion.line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="stroke-current text-black dark:text-white dark:opacity-70 opacity-70"
                strokeWidth="1.5"
                initial={{ x2: x1, y2: y1 }}
                animate={{ x2, y2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            );
          })}
        </svg>
        <span className="absolute top-48 w-[calc(100%-70%)] h-[calc(100%-70%)] bg-primary-foreground dark:bg-primary blur-[80px]"></span>
      </div>
    </div>
  );
};

export function ShineCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative size-80 overflow-hidden flex flex-col items-center gap-2 justify-center border rounded-[1rem] p-2">
      {children}
      <div className="absolute inset-0 flex w-full h-full justify-center items-center z-10 [transform:translateX(-130%)_skew(25deg)] duration-1000 group-hover:duration-1000 group-hover:[transform:translateX(130%)_skew(15deg)]">
        <div className="w-20 h-full bg-primary/40 blur-[80px]"></div>
      </div>
    </div>
  );
}

export default CircleWaveform;
