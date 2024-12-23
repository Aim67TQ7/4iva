import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { photos } = await req.json()
    
    const prompt = `You are a 5S workplace organization expert. Analyze these workplace photos and provide scores from 1-5 for each of the 5S principles (Sort, Set in Order, Shine, Standardize, Sustain) and detailed feedback. Format your response as JSON with these fields: sortScore, setInOrderScore, shineScore, standardizeScore, sustainScore, and feedback.

Base64 encoded photos to analyze: ${photos.join(', ')}

Consider:
- Sort: Are unnecessary items removed?
- Set in Order: Is there a clear place for everything?
- Shine: Is the area clean and well-maintained?
- Standardize: Are there clear visual controls and procedures?
- Sustain: Are there systems to maintain the other 4S principles?`

    console.log("Sending request to Claude API...");
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: "You are a 5S workplace organization expert. Analyze workplace photos and provide numerical scores and feedback. Always respond in valid JSON format."
      })
    })

    console.log("Received response from Claude API");
    const result = await response.json()
    
    if (!response.ok) {
      console.error("Claude API error:", result);
      throw new Error('Failed to evaluate workspace')
    }

    console.log("Parsing Claude response...");
    const evaluation = JSON.parse(result.content[0].text)
    console.log("Evaluation result:", evaluation);

    return new Response(
      JSON.stringify(evaluation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})