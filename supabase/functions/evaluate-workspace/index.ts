import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos } = await req.json();
    
    if (!Array.isArray(photos) || photos.length === 0) {
      throw new Error('No photos provided or invalid photos format');
    }

    // Process and validate photos - limit size by taking a smaller portion
    const processedPhotos = photos.slice(0, 4).map(photo => {
      if (typeof photo !== 'string') return '';
      return photo.substring(0, 10000);
    }).filter(photo => photo.length > 0);

    if (processedPhotos.length === 0) {
      throw new Error('No valid photos after processing');
    }

    console.log(`Processing ${processedPhotos.length} photos`);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY');
    }

    const prompt = `As a 5S workplace organization expert, analyze these workspace photos in detail. For each 5S principle, identify SPECIFIC items, locations, and conditions visible in the photos. Your evaluation should include:

1. Sort (Seiri):
- List specific unnecessary items you can see
- Identify visible red-tag items or areas
- Note any obvious redundant or obsolete equipment
- Point out specific storage issues

2. Set in Order (Seiton):
- Describe specific examples of good/poor item placement
- Note any visible labeling systems or their absence
- Identify specific areas where items are well/poorly organized
- Point out any shadow boards or visual management tools

3. Shine (Seiso):
- List specific areas or equipment that need cleaning
- Note any visible maintenance issues
- Identify specific cleanliness concerns
- Point out any cleaning tools or schedules visible

4. Standardize (Seiketsu):
- Describe any visible standard procedures or instructions
- Note specific examples of visual controls
- Identify any visible audit or checklist systems
- Point out specific areas showing consistent/inconsistent standards

5. Sustain (Shitsuke):
- Note any visible evidence of regular maintenance
- Identify specific signs of continuous improvement
- Point out any visible tracking or monitoring systems
- List specific examples of good/poor practice maintenance

IMPORTANT: You must respond with a valid JSON object containing exactly these fields:
{
  "sortScore": (a number between 1-10),
  "setInOrderScore": (a number between 1-10),
  "shineScore": (a number between 1-10),
  "standardizeScore": (a number, must be 0 if base score < 22),
  "sustainScore": (a number, must be 0 if base score < 22),
  "feedback": "Detailed feedback with SPECIFIC examples from the photos for each category"
}

Base64 photo data: ${processedPhotos.join(' | ')}`;

    console.log("Sending request to Claude API...");
    
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
        system: "You are a 5S workplace organization expert. You MUST respond with a valid JSON object containing exactly these fields: sortScore (1-10), setInOrderScore (1-10), shineScore (1-10), standardizeScore (0 or 1-10 if base score >= 22), sustainScore (0 or 1-10 if base score >= 22), and feedback (string with specific examples). NO OTHER TEXT OR FORMATTING IS ALLOWED IN YOUR RESPONSE.",
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API error response:", errorData);
      throw new Error(`Claude API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Claude API raw response:", result);

    if (!result.content || !result.content[0] || !result.content[0].text) {
      console.error("Invalid Claude API response format:", result);
      throw new Error('Invalid response format from Claude API');
    }

    let evaluation;
    try {
      // Try to extract JSON from the response text
      const text = result.content[0].text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No JSON object found in response:", text);
        throw new Error('No JSON object found in Claude response');
      }
      evaluation = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", result.content[0].text);
      throw new Error('Failed to parse evaluation result as JSON');
    }

    // Validate the evaluation object
    const requiredFields = ['sortScore', 'setInOrderScore', 'shineScore', 'standardizeScore', 'sustainScore', 'feedback'];
    const missingFields = requiredFields.filter(field => !(field in evaluation));
    
    if (missingFields.length > 0) {
      console.error("Missing required fields in evaluation:", missingFields);
      throw new Error(`Missing required fields in evaluation: ${missingFields.join(', ')}`);
    }

    // Validate score types and ranges
    const scores = ['sortScore', 'setInOrderScore', 'shineScore', 'standardizeScore', 'sustainScore'];
    for (const score of scores) {
      if (typeof evaluation[score] !== 'number' || evaluation[score] < 0 || evaluation[score] > 10) {
        console.error(`Invalid score for ${score}:`, evaluation[score]);
        throw new Error(`Invalid score for ${score}: must be a number between 0 and 10`);
      }
    }

    // Enforce scoring rules
    const baseScore = evaluation.sortScore + evaluation.setInOrderScore + evaluation.shineScore;
    if (baseScore < 22) {
      evaluation.standardizeScore = 0;
      evaluation.sustainScore = 0;
    }

    console.log("Final evaluation result:", evaluation);

    return new Response(
      JSON.stringify(evaluation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
    );
  }
});