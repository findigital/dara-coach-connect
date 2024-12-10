import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  isActive: boolean;
  isUser?: boolean;
  size?: 'sm' | 'lg';
}

const AudioWaveform = ({ isActive, isUser = false, size = 'sm' }: AudioWaveformProps) => {
  const bars = size === 'lg' ? 100 : 30;
  const maxHeight = size === 'lg' ? 16 : 6;
  const minHeight = size === 'lg' ? 8 : 2;

  return (
    <div 
      className={`flex items-center gap-0.5 ${
        size === 'lg' ? 'h-32 w-32' : 'h-8'
      } ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full transition-all duration-150 ${
            isUser ? 'bg-blue-500' : 'bg-gray-300'
          } ${
            isActive
              ? `h-${Math.random() > 0.5 ? maxHeight : minHeight} animate-pulse`
              : `h-${minHeight}`
          }`}
          style={{
            animationDelay: `${i * 50}ms`,
            transform: size === 'lg' ? `rotate(${(i * 360) / bars}deg)` : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;