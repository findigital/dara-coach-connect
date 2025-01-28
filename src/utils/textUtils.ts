export const convertLinksToAnchors = (text: string): string => {
  // URL regex pattern that matches common URL formats
  const urlPattern = /\b(?:https?:\/\/|www\.)[^\s[\]<>]*[^\s.,;:?!#\]\[<>]/g;
  
  return text.replace(urlPattern, (url) => {
    const href = url.startsWith('www.') ? `https://${url}` : url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${url}</a>`;
  });
};