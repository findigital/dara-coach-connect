import { supabase } from "@/integrations/supabase/client";

export const streamChatResponse = async (
  content: string,
  onChunk: (content: string) => void
) => {
  const response = await supabase.functions.invoke('chat-with-dara', {
    body: { message: content }
  });

  if (!response.data) throw new Error('No response data');

  // Create a TextDecoder to handle the streaming response
  const decoder = new TextDecoder();
  const reader = response.data.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and split into lines
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.error('Error parsing SSE message:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};