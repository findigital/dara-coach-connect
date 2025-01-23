import React from 'react';

interface AudioVisualizerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const AudioVisualizer = ({ canvasRef }: AudioVisualizerProps) => {
  return (
    <div className="w-full h-32 bg-dara-gray rounded-lg p-4">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={600}
        height={100}
      />
    </div>
  );
};

export default AudioVisualizer;