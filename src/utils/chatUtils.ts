import { supabase } from "@/integrations/supabase/client";

export const streamChatResponse = async (
  content: string,
  onChunk: (content: string) => void
) => {
  const response = await supabase.functions.invoke('chat-with-dara', {
    body: { message: content },
  });

  if (!response.data) throw new Error('No response data');

  const reader = new ReadableStream({
    start(controller) {
      const text = new TextEncoder().encode(response.data);
      controller.enqueue(text);
      controller.close();
    },
  }).getReader();

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
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
};