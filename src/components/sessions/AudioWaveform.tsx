import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isActive: boolean;
}

const AudioWaveform = ({ isActive }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let mediaStream: MediaStream | null = null;

    const initializeAudio = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        
        animate();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    const animate = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        ctx.fillStyle = '#F7F7F7';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        const barWidth = (WIDTH / dataArrayRef.current.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          barHeight = (dataArrayRef.current[i] / 255) * HEIGHT;
          
          const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
          gradient.addColorStop(0, '#FFE135');
          gradient.addColorStop(1, '#1E3D59');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
        
        animationRef.current = requestAnimationFrame(draw);
      };
      
      draw();
    };

    if (isActive) {
      initializeAudio();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isActive]);

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

export default AudioWaveform;