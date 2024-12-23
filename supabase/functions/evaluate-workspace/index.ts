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
1. A score from 1-10 (where 1 is poor and 10 is excellent)
2. Specific observations and recommendations

IMPORTANT SCORING RULES:
- Scores must be whole numbers between 1 and 10
- The base score is the sum of Sort + Set in Order + Shine scores
- If the base score is less than 22, Standardize and Sustain scores must be 0
- If the base score is 22 or higher, provide scores for Standardize and Sustain

Evaluate these principles:

Sort (Seiri):
- Are unnecessary items removed?
- Is there clear distinction between needed and unneeded items?
- Are there items that should be eliminated?
- Is there a clear red-tag system in place?
- Is frequency of use considered in storage decisions?

Set in Order (Seiton):
- Is there a clear place for everything?
- Are items arranged for easy access and return?
- Are storage locations clearly marked and labeled?
- Are shadow boards and visual management systems used effectively?
- Is item placement optimized based on frequency of use?

Shine (Seiso):
- Is the area clean and well-maintained?
- Are equipment and tools in good condition?
- Are cleaning routines evident and documented?
- Is preventive maintenance being performed?
- Are cleaning responsibilities clearly assigned?

Standardize (Seiketsu) - Only score if base score ≥ 22:
- Are there clear visual controls and procedures?
- Are standards documented and visible?
- Is there consistency across the workspace?
- Are best practices well-documented and followed?
- Are regular audits performed to ensure compliance?

Sustain (Shitsuke) - Only score if base score ≥ 22:
- Are there systems to maintain the other 4S principles?
- Is there evidence of regular audits or checks?
- Is there a culture of continuous improvement?
- Is team engagement evident in maintaining standards?
- Are improvements consistently implemented and tracked?

Base64 encoded photos to analyze: ${processedPhotos.join(', ')}

Respond with valid JSON only, following this exact format:
{
  "sortScore": number (1-10),
  "setInOrderScore": number (1-10),
  "shineScore": number (1-10),
  "standardizeScore": number (0 or 1-10, must be 0 if base score < 22),
  "sustainScore": number (0 or 1-10, must be 0 if base score < 22),
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
        system: "You are a 5S workplace organization expert. Analyze workplace photos and provide numerical scores and feedback. Always respond in valid JSON format with exactly these fields: sortScore, setInOrderScore, shineScore, standardizeScore, sustainScore, and feedback. Ensure scores follow the rules: 1-10 range, whole numbers only, and if base score (Sort + Set + Shine) is less than 22, then Standardize and Sustain must be 0."
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

    // Enforce scoring rules
    const baseScore = evaluation.sortScore + evaluation.setInOrderScore + evaluation.shineScore;
    if (baseScore < 22) {
      evaluation.standardizeScore = 0;
      evaluation.sustainScore = 0;
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