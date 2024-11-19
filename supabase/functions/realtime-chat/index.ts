import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.0.0";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const therapeuticPrompt = `As an AI therapist, chat with me as an AI cognitive-behavioral therapist. Adapt your approach to be sensitive to my cultural background, values, and beliefs, but do so naturally as part of the conversation. The goal is to make me feel heard and understood while providing relevant support, not to constantly highlight our differences.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Received audio data, processing...');

    // Convert base64 to Uint8Array for Deno
    const base64Data = audio.replace(/^data:audio\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a blob for OpenAI API
    const audioBlob = new Blob([bytes], { type: 'audio/wav' });

    console.log('Converting audio to transcription...');

    // Get transcription from OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
    });

    console.log('Transcription received:', transcription.text);

    // Get AI response using the transcription
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: therapeuticPrompt },
        { role: 'user', content: transcription.text }
      ],
    });

    console.log('Chat completion received');
    
    // Convert response to speech
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy',
        input: completion.choices[0].message.content,
      }),
    });

    if (!speechResponse.ok) {
      throw new Error(`OpenAI Speech API error: ${speechResponse.statusText}`);
    }

    console.log('Speech response received, converting to base64...');

    const audioBuffer = await speechResponse.arrayBuffer();
    const audioBase64 = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    return new Response(
      JSON.stringify({
        reply: completion.choices[0].message.content,
        audioResponse: audioBase64,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    
    // Handle OpenAI API specific errors
    if (error.response) {
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${error.response.statusText}`,
          details: error.response.data
        }),
        { 
          status: error.response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle general errors
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});