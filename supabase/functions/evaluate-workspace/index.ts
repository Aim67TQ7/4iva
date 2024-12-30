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

    const prompt = `As a 5S workplace organization expert, conduct a detailed evaluation of these workspace photos. Analyze and score each category from 1-10 based on specific visual evidence:

Sort (Organization):
- Evidence of red-tag system implementation
- Clear distinction between necessary and unnecessary items
- Proper categorization based on frequency of use
- Removal of obsolete or excess items
- Clear decision criteria for item retention

Set in Order (Orderliness):
- Presence and effectiveness of visual management systems
- Strategic placement of items based on usage frequency
- Use of shadow boards and clear labeling
- Efficient workflow patterns and space utilization
- Accessibility of frequently used items

Shine (Cleanliness):
- Overall cleanliness of workspace and equipment
- Evidence of regular cleaning routines
- Equipment maintenance standards
- Cleanliness of surfaces, tools, and machinery
- Signs of preventive maintenance implementation

If Sort + Set + Shine ≥ 22, also evaluate:

Standardize (Standardization):
- Implementation of visual controls
- Evidence of documented procedures
- Consistency in organization methods
- Clear workplace standards
- Regular auditing systems

Sustain (Sustainability):
- Signs of continuous improvement culture
- Evidence of regular audits
- Team engagement indicators
- Maintenance of established standards
- Documentation of improvements

Analyze the photos: ${processedPhotos.join(', ')}

Provide scores and specific feedback based on visual evidence. Response must be valid JSON:
{
  "sortScore": 1-10,
  "setInOrderScore": 1-10,
  "shineScore": 1-10,
  "standardizeScore": 0-10,
  "sustainScore": 0-10,
  "feedback": "Detailed observations and specific recommendations for each category"
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
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }],
        system: "You are a 5S workplace organization expert. Provide detailed, specific scores and feedback based on visual evidence in workspace photos. Focus on concrete observations and actionable recommendations. Avoid generic language."
      })
    });

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

    console.log('Evaluation results:', evaluation);

    return new Response(
      JSON.stringify(evaluation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in evaluate-workspace function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Evaluation failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
});