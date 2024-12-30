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
      return photo.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    }).filter(photo => photo.length > 0);

    if (processedPhotos.length === 0) {
      throw new Error('No valid photos after processing');
    }

    console.log(`Processing ${processedPhotos.length} photos`);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY');
    }

    const systemPrompt = `You are a 5S workplace organization expert. Analyze the provided workspace photos and provide scores and detailed feedback. Your response must be valid JSON with this exact structure:
{
  "sortScore": number between 1-10,
  "setInOrderScore": number between 1-10,
  "shineScore": number between 1-10,
  "standardizeScore": number between 0-10,
  "sustainScore": number between 0-10,
  "feedback": "detailed feedback string"
}`;

    const userPrompt = `Analyze these workspace photos and provide detailed scores and feedback for each 5S category:

1. Sort (Organization) - Score 1-10:
- Evidence of red-tag system
- Clear distinction between necessary/unnecessary items
- Proper categorization by frequency of use
- Removal of obsolete items

2. Set in Order (Orderliness) - Score 1-10:
- Visual management systems
- Strategic item placement
- Use of shadow boards and labels
- Efficient workflow patterns

3. Shine (Cleanliness) - Score 1-10:
- Workspace and equipment cleanliness
- Regular cleaning routines
- Equipment maintenance
- Surface cleanliness

If Sort + Set + Shine ≥ 22, also evaluate:

4. Standardize (Standardization) - Score 1-10:
- Visual controls
- Documented procedures
- Consistency in methods
- Regular auditing

5. Sustain (Sustainability) - Score 1-10:
- Continuous improvement culture
- Regular audits
- Team engagement
- Standards maintenance

Provide specific, detailed feedback based on visual evidence. Avoid generic language.`;

    console.log('Sending request to Anthropic API...');

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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${userPrompt}\n\nAnalyze these photos: ${processedPhotos.length} workspace photos provided` }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      throw new Error(`Anthropic API error: ${errorData}`);
    }

    const result = await response.json();
    console.log('Received response from Anthropic API');

    if (!result.content || !result.content[0] || !result.content[0].text) {
      console.error('Invalid Anthropic API response format:', result);
      throw new Error('Invalid response format from Anthropic API');
    }

    try {
      // Parse and validate the AI response
      const aiResponse = result.content[0].text;
      console.log('AI Response:', aiResponse);
      
      const evaluation = JSON.parse(aiResponse);
      
      // Validate required fields and score ranges
      const requiredFields = ['sortScore', 'setInOrderScore', 'shineScore', 'standardizeScore', 'sustainScore', 'feedback'];
      const missingFields = requiredFields.filter(field => !(field in evaluation));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure scores are numbers and within valid ranges
      const validateScore = (score: number, min: number, max: number) => {
        return Number.isInteger(score) && score >= min && score <= max;
      };

      if (!validateScore(evaluation.sortScore, 1, 10) ||
          !validateScore(evaluation.setInOrderScore, 1, 10) ||
          !validateScore(evaluation.shineScore, 1, 10) ||
          !validateScore(evaluation.standardizeScore, 0, 10) ||
          !validateScore(evaluation.sustainScore, 0, 10)) {
        throw new Error('Invalid score values');
      }

      // Apply business rules for standardize and sustain scores
      const baseScore = evaluation.sortScore + evaluation.setInOrderScore + evaluation.shineScore;
      if (baseScore < 22) {
        evaluation.standardizeScore = 0;
        evaluation.sustainScore = 0;
      }

      console.log('Successfully parsed and validated evaluation:', evaluation);

      return new Response(
        JSON.stringify(evaluation),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse evaluation result:', parseError);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in evaluate-workspace function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Evaluation failed',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});