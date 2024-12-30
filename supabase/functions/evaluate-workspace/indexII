import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    
    // Limit photos and size
    const processedPhotos = photos.slice(0, 3).map(p => 
      p.length > 30000 ? p.substring(0, 30000) : p
    );

    const prompt = `As a 5S expert, evaluate these workplace photos. Score 1-10 and give feedback for each:

Sort:
- Remove unnecessary items
- Distinguish needed/unneeded
- Consider usage frequency

Set in Order:
- Clear storage locations
- Easy access/return
- Visual management

Shine:
- Cleanliness
- Maintenance
- Cleaning routines

If Sort + Set + Shine ≥ 22, also score:

Standardize:
- Visual controls
- Documented standards
- Consistency

Sustain:
- Maintenance systems
- Regular audits
- Continuous improvement

Photos: ${processedPhotos.join(', ')}

Respond with JSON only:
{
  "sortScore": 1-10,
  "setInOrderScore": 1-10,
  "shineScore": 1-10,
  "standardizeScore": 0-10,
  "sustainScore": 0-10,
  "feedback": "Brief observations and key recommendations for each category"
}`

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) throw new Error('Missing API key');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: "You are a 5S expert. Provide concise scores (1-10) and feedback for workplace photos. Response must be valid JSON with: sortScore, setInOrderScore, shineScore, standardizeScore, sustainScore, feedback. If base score < 22, standardize and sustain = 0."
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${(await response.json()).error?.message || 'Unknown error'}`)
    }

    const result = await response.json()
    const evaluation = JSON.parse(result.content[0].text);

    // Enforce scoring rules
    const baseScore = evaluation.sortScore + evaluation.setInOrderScore + evaluation.shineScore;
    if (baseScore < 22) {
      evaluation.standardizeScore = 0;
      evaluation.sustainScore = 0;
    }

    return new Response(
      JSON.stringify(evaluation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Evaluation failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
