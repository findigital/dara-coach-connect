export const setupAudioVisualization = (
  stream: MediaStream,
  audioIndicatorRef: React.RefObject<HTMLDivElement>
) => {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 256;

  source.connect(analyzer);

  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const updateIndicator = () => {
    if (!audioContext) return;

    analyzer.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;

    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.toggle("active", average > 30);
    }

    requestAnimationFrame(updateIndicator);
  };

  updateIndicator();
  return audioContext;
};

export const getVolume = (analyser: AnalyserNode): number => {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const float = (dataArray[i] - 128) / 128;
    sum += float * float;
  }
  
  return Math.sqrt(sum / dataArray.length);
};