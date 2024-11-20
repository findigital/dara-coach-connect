import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  text: string;
}

interface OpenAIResponse {
  error?: {
    message: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const body: RequestBody = await req.json();
    console.log('Received text for TTS:', body.text);

    if (!body.text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Making request to OpenAI TTS API');
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy',
        input: body.text,
      }),
    });

    if (!response.ok) {
      const errorData: OpenAIResponse = await response.json();
      console.error('OpenAI TTS API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const chunks: number[] = [];
    const uint8Array = new Uint8Array(audioBuffer);
    
    // Process the array in smaller chunks to avoid stack overflow
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      chunks.push(...Array.from(chunk));
    }
    
    const audioBase64 = btoa(String.fromCharCode(...chunks));
    console.log('Successfully generated audio');
    
    return new Response(
      JSON.stringify(audioBase64),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});