import { JobContext, WorkerOptions, cli, defineAgent, multimodal } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import { JobType } from '@livekit/protocol';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const agent = defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    const agent = new multimodal.MultimodalAgent({
      model: new openai.realtime.RealtimeModel({
        instructions: `You are Dara, a helpful and friendly AI assistant. Your responses should be warm, 
        engaging, and concise. Focus on being helpful while maintaining a natural conversation flow.`,
        voice: 'alloy',
        temperature: 0.8,
        maxResponseOutputTokens: Infinity,
        modalities: ['text', 'audio'],
        turnDetection: {
          type: 'server_vad',
          threshold: 0.5,
          silence_duration_ms: 200,
          prefix_padding_ms: 300,
        },
      }),
    });

    await agent.start(ctx.room);
  },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, roomId } = await req.json();
    
    if (!audio || !roomId) {
      return new Response(
        JSON.stringify({ error: 'Audio data and room ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workerOptions = new WorkerOptions({ 
      agent, 
      workerType: JobType.JT_ROOM,
      openAIApiKey: OPENAI_API_KEY,
    });

    const context = new JobContext(roomId);
    await agent.entry(context);

    return new Response(
      JSON.stringify({ success: true, roomId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'LiveKit agent error',
        message: error.message,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});