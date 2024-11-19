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

const SUPPORTED_FORMATS = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'];

async function processAudioData(audioData: string) {
  try {
    const mimeMatch = audioData.match(/^data:(audio\/[^;]+);base64,/);
    if (!mimeMatch) {
      throw new Error('Invalid audio data format');
    }

    const mimeType = mimeMatch[1];
    const format = mimeType.split('/')[1];
    
    if (!SUPPORTED_FORMATS.includes(format)) {
      throw new Error(`Unsupported audio format: ${format}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
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
    const { audio } = await req.json();
    
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing audio data...');
    const audioFile = await processAudioData(audio);
    console.log('Audio file processed successfully');

    console.log('Sending to Whisper API...');
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: transcription.text }
      ],
    });

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
      const errorData = await speechResponse.json().catch(() => ({}));
      throw new Error(`OpenAI Speech API error: ${speechResponse.statusText}. ${JSON.stringify(errorData)}`);
    }

    const audioBuffer = await speechResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(
      JSON.stringify({
        reply: completion.choices[0].message.content,
        audioResponse: `data:audio/mpeg;base64,${audioBase64}`,
        transcription: transcription.text,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    
    const status = error.response?.status || 500;
    const errorMessage = error.response?.statusText || 'Internal server error';
    
    return new Response(
      JSON.stringify({ 
        error: `OpenAI API error`,
        message: errorMessage,
        details: error.response?.data || 'No additional details available'
      }),
      { 
        status: status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});