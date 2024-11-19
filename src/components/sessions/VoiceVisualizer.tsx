import React, { useEffect, useRef, useState } from 'react';
import Wave from 'react-wavify';

interface VoiceVisualizerProps {
  isActive: boolean;
}

const VoiceVisualizer = ({ isActive }: VoiceVisualizerProps) => {
  const [amplitude, setAmplitude] = useState(20);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isActive) {
      const animate = () => {
        setAmplitude(prev => {
          const newValue = prev + (Math.random() * 2 - 1) * 5;
          return Math.max(15, Math.min(40, newValue));
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAmplitude(20);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-48 h-48 rounded-full overflow-hidden bg-dara-navy mb-4">
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'opacity-50'
        }`}
      >
        <Wave
          fill="#FFE135"
          paused={!isActive}
          options={{
            height: 20,
            amplitude: amplitude,
            speed: 0.3,
            points: 3
          }}
        />
      </div>
    </div>
  );
};

export default VoiceVisualizer;