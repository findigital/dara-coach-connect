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

    const prompt = `Act as a wellness expert. Find and recommend wellness activities, centers, and programs near zip code ${zipCode}. ${preferences ? `Consider these preferences: ${preferences}` : ''} Focus on providing specific, actionable recommendations with location details when possible. Be concise and practical.`

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
            content: 'You are a helpful wellness expert. Be precise and concise.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
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