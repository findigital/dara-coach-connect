export const convertLinksToAnchors = (text: string): string => {
  // URL regex pattern that matches common URL formats
  const urlPattern = /\b(?:https?:\/\/|www\.)[^\s[\]<>]*[^\s.,;:?!#\]\[<>]/g;
  
  // First replace URLs with anchor tags that open in new tabs
  let processedText = text.replace(urlPattern, (url) => {
    const href = url.startsWith('www.') ? `https://${url}` : url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`;
  });
  
  // Replace newlines with paragraph breaks
  processedText = processedText.replace(/\n\n/g, '</p><p class="mt-4">');
  processedText = processedText.replace(/\n/g, '<br />');
  
  // Wrap the entire text in a paragraph tag if it's not already
  if (!processedText.startsWith('<p>')) {
    processedText = `<p>${processedText}</p>`;
  }
  
  return processedText;
};