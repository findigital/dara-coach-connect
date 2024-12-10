import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  isActive: boolean;
  isUser?: boolean;
}

const AudioWaveform = ({ isActive, isUser = false }: AudioWaveformProps) => {
  const bars = 30; // Number of bars in the waveform

  return (
    <div className={`flex items-center gap-0.5 h-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full transition-all duration-150 ${
            isUser ? 'bg-dara-yellow' : 'bg-gray-300'
          } ${
            isActive
              ? `h-${Math.random() > 0.5 ? '6' : '4'} animate-pulse`
              : 'h-2'
          }`}
          style={{
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;