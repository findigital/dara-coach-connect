import React from 'react';
import AudioVisualizer from './audio/AudioVisualizer';
import { useAudioVisualization } from './audio/useAudioVisualization';

interface AudioWaveformProps {
  isActive: boolean;
}

const AudioWaveform = ({ isActive }: AudioWaveformProps) => {
  const { canvasRef } = useAudioVisualization(isActive);

  return <AudioVisualizer canvasRef={canvasRef} />;
};

export default AudioWaveform;