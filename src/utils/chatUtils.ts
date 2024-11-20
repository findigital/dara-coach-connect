import { supabase } from "@/integrations/supabase/client";

export const streamChatResponse = async (
  content: string,
  onChunk: (content: string) => void
) => {
  const response = await supabase.functions.invoke('chat-with-dara', {
    body: { message: content }
  });

  if (!response.data) throw new Error('No response data');

  // Parse the response data as a string
  const text = response.data;
  const lines = text.split('\n');
  
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
};