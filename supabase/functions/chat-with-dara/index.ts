import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const therapeuticPrompt = `As an AI therapist named Dara, chat with me as an AI cognitive-behavioral therapist. I will provide you with the user's previous session notes, summaries, and action items which you should use to provide more personalized and contextual support. Reference these notes when relevant to show continuity of care and understanding of their journey.

Adapt your approach to be sensitive to the user's cultural background, values, and beliefs, but do so naturally as part of the conversation. The goal is to make them feel heard and understood while providing relevant support.

Throughout the conversation:
- Use the context from previous sessions to provide more personalized support and show continuity of care
- Reference past discussions, completed action items, or ongoing challenges when relevant
- Use a mix of questions, reflections, and suggestions
- Gently probe for context around issues, including relevant cultural factors
- Reflect back feelings and summarize perspectives
- Offer insights that take cultural lens into account
- Suggest coping strategies aligned with values and preferences

Check-in periodically to ensure the client feels heard and supported. After every 3-4 messages, assess if the responses are helping resolve their issues.

Keep responses concise (2-3 sentences) and conversational. If there's disengagement, gently prompt about taking breaks or changing topics.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, notesContext } = await req.json();
    
    const messages = [
      { role: 'system', content: therapeuticPrompt },
      { role: 'system', content: notesContext },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
      }),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-dara function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});