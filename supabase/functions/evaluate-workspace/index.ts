import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function callClaudeAPI(prompt: string, retryCount = 0): Promise<any> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY');
  }

  try {
    console.log(`Attempt ${retryCount + 1} to call Claude API`);
    
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
      
      // If we get an overloaded error and haven't exceeded retries, attempt retry
      if (errorData.error?.type === "overloaded_error" && retryCount < MAX_RETRIES) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying in ${retryDelay}ms...`);
        await delay(retryDelay);
        return callClaudeAPI(prompt, retryCount + 1);
      }
      
      throw new Error(`Claude API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log("Claude API raw response:", result);

    if (!result.content || !result.content[0] || !result.content[0].text) {
      throw new Error('Invalid response format from Claude API');
    }

    const text = result.content[0].text.trim();
    console.log("Claude response text:", text);

    // Try to extract JSON from the response text using regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in Claude response');
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    // Validate the evaluation object
    const requiredFields = ['sortScore', 'setInOrderScore', 'shineScore', 'standardizeScore', 'sustainScore', 'feedback'];
    const missingFields = requiredFields.filter(field => !(field in evaluation));
    
    if (missingFields.length > 0) {
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

    return evaluation;
  } catch (error) {
    if (retryCount < MAX_RETRIES && error.message.includes('overloaded')) {
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Error occurred, retrying in ${retryDelay}ms...`);
      await delay(retryDelay);
      return callClaudeAPI(prompt, retryCount + 1);
    }
    throw error;
  }
}

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

    const evaluation = await callClaudeAPI(prompt);

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