import WebSocket from "ws";
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
    const ws = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", {
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    ws.on("open", function open() {
      console.log("Connected to OpenAI server");
      ws.send(JSON.stringify({
        type: "session.update",
        session: {
          instructions: therapeuticPrompt,
          voice: "alloy",
          input_audio_transcription: true,
        }
      }));
    });

    let audioBuffer = [];

    ws.on("message", function incoming(message) {
      const event = JSON.parse(message.toString());
      console.log("Received event:", event);

      if (event.type === "error") {
        console.error("OpenAI error:", event.error);
      }
    });

    // Handle audio input from client
    const { audio } = await req.json();
    
    if (audio) {
      ws.send(JSON.stringify({
        type: "input_audio_buffer.append",
        audio: audio,
      }));

      // Request response after audio input
      ws.send(JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
        }
      }));
    }

    return new Response(JSON.stringify({ status: "Audio processed" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});