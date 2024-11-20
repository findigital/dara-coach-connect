import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, type } = await req.json();
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch chat messages for the session
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    const chatHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    let prompt = '';
    let response;

    switch (type) {
      case 'title':
        prompt = `Based on this coaching session chat history, generate a concise and descriptive title (max 5 words) that captures the main theme:\n\n${chatHistory}`;
        response = await generateOpenAIResponse(prompt);
        
        // Update session title
        await supabase
          .from('coaching_sessions')
          .update({ title: response })
          .eq('id', sessionId);
        
        break;

      case 'summary':
        prompt = `Based on this coaching session chat history, provide a concise summary (2-3 sentences) of the key points discussed:\n\n${chatHistory}`;
        response = await generateOpenAIResponse(prompt);
        
        // Update session summary
        await supabase
          .from('coaching_sessions')
          .update({ summary: response })
          .eq('id', sessionId);
        
        break;

      case 'action_items':
        prompt = `Based on this coaching session chat history, generate 3-5 specific, actionable tasks that the client should complete. Format each task in a clear, concise way:\n\n${chatHistory}`;
        response = await generateOpenAIResponse(prompt);
        
        // Parse action items and insert them
        const actionItems = response.split('\n').filter(item => item.trim());
        const actionItemsData = actionItems.map(content => ({
          session_id: sessionId,
          content: content.replace(/^\d+\.\s*/, ''), // Remove leading numbers
        }));
        
        await supabase
          .from('action_items')
          .insert(actionItemsData);
        
        break;
    }

    return new Response(JSON.stringify({ success: true, data: response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateOpenAIResponse(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a professional coach helping to summarize coaching sessions and create action plans.' },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}