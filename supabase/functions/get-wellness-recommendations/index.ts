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

    const systemPrompt = `You are a helpful wellness expert assistant. Your responses should be structured and easy to read. When recommending locations:
    1. Always include the full address
    2. Mention distance from the provided zip code when possible
    3. Include any relevant contact information
    4. Group recommendations by category (e.g., Yoga Studios, Fitness Centers, etc.)
    5. Provide 2-3 options for each category
    6. Format the response in a clear, readable way with proper spacing and bullet points`

    const userPrompt = `Find and recommend wellness activities, centers, and programs near zip code ${zipCode}. ${
      preferences ? `Consider these preferences: ${preferences}. ` : ''
    }Please provide specific, actionable recommendations with location details.`

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
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    const data = await response.json()
    console.log('Perplexity API response:', data)

    return new Response(JSON.stringify(data), {
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