import { useState, useCallback } from 'react';

export const useVolumeMonitor = () => {
  const [currentVolume, setCurrentVolume] = useState(0);

  const handleVolumeChange = useCallback((audioContext: AudioContext, source: MediaStreamAudioSourceNode) => {
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      if (!source.mediaStream.active) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;
      setCurrentVolume(average / 128.0); // Normalize to 0-1 range
      
      requestAnimationFrame(updateVolume);
    };

    updateVolume();
  }, []);

  return {
    currentVolume,
    handleVolumeChange
  };
};