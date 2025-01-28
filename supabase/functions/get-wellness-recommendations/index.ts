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

    const systemPrompt = `You are a helpful wellness expert assistant. Present your recommendations in a markdown table format with the following columns:
    - Name
    - Type (e.g., Yoga Studio, Wellness Center)
    - Address
    - Distance
    - Contact
    - Additional Info
    
    Format guidelines:
    1. Use proper markdown table syntax with headers
    2. Keep each field concise but informative
    3. Include full addresses
    4. Show distance from provided zip code
    5. Include relevant contact information
    6. Group similar types together`

    const userPrompt = `Find and recommend wellness activities, centers, and programs near zip code ${zipCode}. ${
      preferences ? `Consider these preferences: ${preferences}. ` : ''
    }Present the results in a markdown table format.`

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