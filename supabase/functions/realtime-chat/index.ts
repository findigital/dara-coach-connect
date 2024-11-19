import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.0.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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

const SUPPORTED_FORMATS = ['webm', 'mp3', 'wav', 'ogg'];

async function processAudioData(audioData: string) {
  try {
    console.log('Processing audio data...');
    const mimeMatch = audioData.match(/^data:(audio\/[^;]+);base64,/);
    if (!mimeMatch) {
      throw new Error('Invalid audio data format');
    }

    const mimeType = mimeMatch[1];
    const format = mimeType.split('/')[1];
    
    if (!SUPPORTED_FORMATS.includes(format)) {
      throw new Error(`Unsupported audio format: ${format}`);
    }

    const base64Data = audioData.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    return new File([binaryData], `audio.${format}`, { type: mimeType });
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request');
    const { audio, roomId } = await req.json();
    
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioFile = await processAudioData(audio);
    console.log('Audio processed successfully');

    console.log('Transcribing audio...');
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });
    console.log('Transcription received:', transcription.text);

    if (!transcription.text.trim()) {
      return new Response(
        JSON.stringify({ message: 'No speech detected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating completion...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: transcription.text }
      ],
    });

    const reply = completion.choices[0].message.content;
    console.log('Generated reply:', reply);

    try {
      console.log('Generating speech...');
      const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: reply,
        }),
      });

      if (!speechResponse.ok) {
        throw new Error(`Speech API error: ${speechResponse.statusText}`);
      }

      const audioBuffer = await speechResponse.arrayBuffer();
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      return new Response(
        JSON.stringify({
          reply,
          audioResponse: `data:audio/mpeg;base64,${audioBase64}`,
          transcription: transcription.text,
          roomId: roomId || crypto.randomUUID(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (speechError) {
      console.error('Speech synthesis error:', speechError);
      // Return text response even if speech synthesis fails
      return new Response(
        JSON.stringify({
          reply,
          transcription: transcription.text,
          roomId: roomId || crypto.randomUUID(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    
    const errorMessage = error.message || 'Internal server error';
    const status = error.status || 500;
    
    return new Response(
      JSON.stringify({ 
        error: 'OpenAI API error',
        message: errorMessage,
        details: error.response?.data || error.message || 'No additional details available'
      }),
      { 
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});