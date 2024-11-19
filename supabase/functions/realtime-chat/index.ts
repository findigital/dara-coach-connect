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

// Helper function to validate and process audio data
async function processAudioData(audioData: string) {
  try {
    // Extract mime type and validate format
    const mimeMatch = audioData.match(/^data:(audio\/[^;]+);base64,/);
    if (!mimeMatch) {
      throw new Error('Invalid audio data format');
    }

    const mimeType = mimeMatch[1];
    const base64Data = audioData.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Create temporary file with .webm extension
    const tempFile = await Deno.makeTempFile({
      prefix: "audio-",
      suffix: ".webm",
    });
    
    // Write binary data to temp file
    await Deno.writeFile(tempFile, binaryData);
    
    // Create File object from the temp file
    const fileBlob = await Deno.readFile(tempFile);
    const file = new File([fileBlob], "audio.webm", { type: "audio/webm" });
    
    // Clean up temp file
    await Deno.remove(tempFile);
    
    return file;
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Get transcription
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

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: transcription.text }
      ],
    });

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
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});