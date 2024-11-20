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

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      console.error('No messages found for session:', sessionId);
      throw new Error('No messages found for this session');
    }

    const chatHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    let prompt = '';
    let updateTable = 'coaching_sessions';
    let updateColumn = '';
    let updateValue = '';

    switch (type) {
      case 'title':
        prompt = `Based on this coaching session chat history, generate a concise and descriptive title (max 5 words) that captures the main theme:\n\n${chatHistory}`;
        updateColumn = 'title';
        break;

      case 'summary':
        prompt = `Based on this coaching session chat history, provide a concise summary (2-3 sentences) of the key points discussed:\n\n${chatHistory}`;
        updateColumn = 'summary';
        break;

      case 'action_items':
        prompt = `Based on this coaching session chat history, generate 3-5 specific, actionable tasks that the client should complete. Format each task in a clear, concise way:\n\n${chatHistory}`;
        updateTable = 'action_items';
        break;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a professional coach helping to analyze coaching sessions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to generate insights');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content.trim();

    if (type === 'action_items') {
      const actionItems = generatedContent.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(content => ({
          session_id: sessionId,
          content: content.replace(/^\d+\.\s*/, ''),
          completed: false,
        }));

      const { error: insertError } = await supabase
        .from('action_items')
        .insert(actionItems);

      if (insertError) {
        console.error('Error inserting action items:', insertError);
        throw insertError;
      }
    } else {
      const { error: updateError } = await supabase
        .from(updateTable)
        .update({ [updateColumn]: generatedContent })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
        throw updateError;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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