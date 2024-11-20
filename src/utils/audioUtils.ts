export const playAudioFromBlob = async (audioBlob: Blob): Promise<HTMLAudioElement> => {
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  return audio;
};