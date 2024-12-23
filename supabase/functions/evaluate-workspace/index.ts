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
    
    // Limit the number of photos and their size in the prompt
    const maxPhotos = 4;
    const processedPhotos = photos.slice(0, maxPhotos).map(photo => {
      // Extract a smaller portion of the base64 string if it's too long
      const maxLength = 50000; // Adjust this value as needed
      return photo.length > maxLength ? photo.substring(0, maxLength) : photo;
    });

    const prompt = `As a 5S workplace organization expert, analyze these workplace photos and provide a detailed evaluation. For each of the 5S principles below, provide:
1. A score from 1-5 (where 1 is poor and 5 is excellent)
2. Specific observations and recommendations

Evaluate these principles:

Sort (Seiri):
- Are unnecessary items removed?
- Is there clear distinction between needed and unneeded items?
- Are there items that should be eliminated?

Set in Order (Seiton):
- Is there a clear place for everything?
- Are items arranged for easy access and return?
- Are storage locations clearly marked and labeled?

Shine (Seiso):
- Is the area clean and well-maintained?
- Are equipment and tools in good condition?
- Are cleaning routines evident?

Standardize (Seiketsu):
- Are there clear visual controls and procedures?
- Are standards documented and visible?
- Is there consistency across the workspace?

Sustain (Shitsuke):
- Are there systems to maintain the other 4S principles?
- Is there evidence of regular audits or checks?
- Is there a culture of continuous improvement?

Base64 encoded photos to analyze: ${processedPhotos.join(', ')}

Respond with valid JSON only, following this exact format:
{
  "sortScore": number (1-5),
  "setInOrderScore": number (1-5),
  "shineScore": number (1-5),
  "standardizeScore": number (1-5),
  "sustainScore": number (1-5),
  "feedback": "Detailed feedback string with specific observations and recommendations for each category"
}`

    console.log("Sending request to Claude API...");
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

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
        system: "You are a 5S workplace organization expert. Analyze workplace photos and provide numerical scores and feedback. Always respond in valid JSON format with exactly these fields: sortScore, setInOrderScore, shineScore, standardizeScore, sustainScore, and feedback."
      })
    })

    console.log("Received response from Claude API");
    const result = await response.json()
    console.log("Claude API raw response:", result);
    
    if (!response.ok) {
      console.error("Claude API error:", result);
      throw new Error(`Claude API error: ${result.error?.message || 'Unknown error'}`)
    }

    if (!result.content || !result.content[0] || !result.content[0].text) {
      console.error("Invalid Claude API response format:", result);
      throw new Error('Invalid response format from Claude API');
    }

    console.log("Parsing Claude response...");
    let evaluation;
    try {
      evaluation = JSON.parse(result.content[0].text);
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", result.content[0].text);
      throw new Error('Failed to parse evaluation result as JSON');
    }

    // Validate the evaluation object has all required fields
    const requiredFields = ['sortScore', 'setInOrderScore', 'shineScore', 'standardizeScore', 'sustainScore', 'feedback'];
    const missingFields = requiredFields.filter(field => !(field in evaluation));
    
    if (missingFields.length > 0) {
      console.error("Missing required fields in evaluation:", missingFields);
      throw new Error(`Missing required fields in evaluation: ${missingFields.join(', ')}`);
    }

    console.log("Evaluation result:", evaluation);

    return new Response(
      JSON.stringify(evaluation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to evaluate workspace',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})