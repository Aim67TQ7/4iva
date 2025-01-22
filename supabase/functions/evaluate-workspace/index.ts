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

    const prompt = `As a 5S workplace organization expert, analyze these workspace photos and provide scores and feedback. Respond with ONLY a JSON object containing these exact fields:

{
  "sortScore": (integer 1-10),
  "setInOrderScore": (integer 1-10),
  "shineScore": (integer 1-10),
  "standardizeScore": (integer, must be 0 if base score < 22),
  "sustainScore": (integer, must be 0 if base score < 22),
  "feedback": "Detailed feedback string"
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
        max_tokens: 4096,
        system: "You are a 5S workplace organization expert. You MUST respond with ONLY a single, valid JSON object containing exactly these fields: sortScore (integer 1-10), setInOrderScore (integer 1-10), shineScore (integer 1-10), standardizeScore (integer, must be 0 if base score < 22), sustainScore (integer, must be 0 if base score < 22), and feedback (string). NO OTHER TEXT OR FORMATTING IS ALLOWED.",
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

    const text = result.content[0].text.trim();
    console.log("Claude response text:", text);

    // Try to extract JSON from the response text using regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON object found in response:", text);
      throw new Error('No JSON object found in Claude response');
    }

    let evaluation;
    try {
      evaluation = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse extracted JSON:", jsonMatch[0]);
      throw new Error('Failed to parse evaluation result as JSON');
    }

    // Validate the evaluation object
    const requiredFields = ['sortScore', 'setInOrderScore', 'shineScore', 'standardizeScore', 'sustainScore', 'feedback'];
    const missingFields = requiredFields.filter(field => !(field in evaluation));
    
    if (missingFields.length > 0) {
      console.error("Missing required fields in evaluation:", missingFields);
      throw new Error(`Missing required fields in evaluation: ${missingFields.join(', ')}`);
    }

    // Validate and convert scores to integers
    const scores = ['sortScore', 'setInOrderScore', 'shineScore', 'standardizeScore', 'sustainScore'];
    for (const score of scores) {
      evaluation[score] = Math.round(Number(evaluation[score]));
      if (isNaN(evaluation[score]) || evaluation[score] < 0 || evaluation[score] > 10) {
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
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to evaluate workspace',
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    );
  }
});