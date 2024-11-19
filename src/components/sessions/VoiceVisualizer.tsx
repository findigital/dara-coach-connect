import React from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
}

const VoiceVisualizer = ({ isActive }: VoiceVisualizerProps) => {
  return (
    <div className="flex justify-center items-center mb-4">
      <img 
        src="/lovable-uploads/eeb53684-b9d5-4bc3-b048-29487993afe1.png" 
        alt="Voice visualization"
        className={`w-48 h-48 ${isActive ? 'animate-pulse' : ''}`}
      />
    </div>
  );
};

export default VoiceVisualizer;