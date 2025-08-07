import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { zipCode, preferences } = await req.json()
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')

    if (!apiKey) {
      throw new Error('Missing Perplexity API key')
    }

    console.log('Fetching wellness recommendations for:', { zipCode, preferences })

    const systemPrompt = `You are a friendly and supportive wellness expert. Provide personalized recommendations for wellness activities in a conversational, friendly tone. Focus on:

    1. Addressing the user directly and warmly
    2. Providing 3-4 specific recommendations that match their preferences
    3. Including practical details like location and contact info naturally in the conversation
    4. Adding brief, encouraging comments about each suggestion
    5. Ending with a warm invitation to try the activities
    6. IMPORTANT: Include actual website URLs for the recommended places

    Keep responses natural and engaging, as if chatting with a friend who knows the local area well.`

    const userPrompt = `Find and recommend wellness activities near zip code ${zipCode}. ${
      preferences ? `Consider these preferences: ${preferences}. ` : ''
    }Make it conversational and friendly. Include actual website URLs when available.`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1800,
        top_p: 0.9,
        reasoning_effort: 'medium',
        search_mode: 'web',
        web_search_options: {
          search_context_size: 'high'
        }
      })
    })

    const data = await response.json()
    console.log('Perplexity API response:', data)

    // Extract URLs from the content using regex
    const urlRegex = /\b(?:https?:\/\/|www\.)[^\s[\]<>]*[^\s.,;:?!#\]\[<>]/g;
    const content = data.choices[0].message.content;
    const citations = content.match(urlRegex) || [];

    // Create the response object with the message content and citations
    const responseData = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: content
          }
        }
      ],
      citations: citations
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})