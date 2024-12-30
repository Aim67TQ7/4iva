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

    // Create a more specific and detailed prompt
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

Provide scores and detailed feedback in this exact JSON format:
{
  "sortScore": (1-10),
  "setInOrderScore": (1-10),
  "shineScore": (1-10),
  "standardizeScore": (number, must be 0 if base score < 22),
  "sustainScore": (number, must be 0 if base score < 22),
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
        system: "You are a 5S workplace organization expert. Analyze workspace photos and provide numerical scores with SPECIFIC, detailed feedback about items and conditions visible in the photos. Always respond in valid JSON format with exactly these fields: sortScore, setInOrderScore, shineScore, standardizeScore, sustainScore, and feedback. Ensure scores follow the rules: 1-10 range, whole numbers only, and if base score (Sort + Set + Shine) is less than 22, then Standardize and Sustain must be 0.",
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log("Received response from Claude API");
    const result = await response.json();
    console.log("Claude API raw response:", result);
    
    if (!response.ok) {
      console.error("Claude API error:", result);
      throw new Error(`Claude API error: ${JSON.stringify(result)}`);
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