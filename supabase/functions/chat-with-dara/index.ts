import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const therapeuticPrompt = `As an AI therapist, chat with me as an AI cognitive-behavioral therapist. Adapt your approach to be sensitive to my cultural background, values, and beliefs, but do so naturally as part of the conversation. The goal is to make me feel heard and understood while providing relevant support, not to constantly highlight our differences.

Begin by warmly welcoming me to the session if this is the first message.

Throughout our conversation:
- Use a mix of questions, reflections, and suggestions
- Gently probe for context around issues, including relevant cultural factors
- Reflect back feelings and summarize perspectives
- Offer insights that take cultural lens into account
- Suggest coping strategies aligned with values and preferences

Check-in periodically to ensure the client feels heard and supported. After every 3-4 messages, assess if the responses are helping resolve their issues.

If appropriate, ask for zip code/location to help find local wellness services or therapists. Use Psychology Today's directory (https://www.psychologytoday.com/us/therapists) for referrals.

Keep responses concise (2-3 sentences) and conversational. If there's disengagement, gently prompt about taking breaks or changing topics.

As sessions near end, summarize insights and action steps discussed. Offer encouragement and clear closure while inviting final thoughts.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log('Received message:', message);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: therapeuticPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);
    
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