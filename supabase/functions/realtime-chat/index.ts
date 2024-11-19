import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Convert base64 to Uint8Array for the audio file
    const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    const audioBlob = new Blob([binaryAudio], { type: 'audio/wav' });

    // Create form data for the audio transcription request
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    // Get transcription from OpenAI
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`OpenAI Transcription API error: ${transcriptionResponse.statusText}`);
    }

    const transcription = await transcriptionResponse.json();
    console.log('Transcription:', transcription);

    // Get AI response using the transcription
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: therapeuticPrompt },
          { role: 'user', content: transcription.text }
        ],
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`OpenAI Chat API error: ${chatResponse.statusText}`);
    }

    const chatData = await chatResponse.json();
    console.log('Chat response:', chatData);
    
    // Convert response to speech
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy',
        input: chatData.choices[0].message.content,
      }),
    });

    if (!speechResponse.ok) {
      throw new Error(`OpenAI Speech API error: ${speechResponse.statusText}`);
    }

    const audioBuffer = await speechResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(
      JSON.stringify({
        reply: chatData.choices[0].message.content,
        audioResponse: audioBase64,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});