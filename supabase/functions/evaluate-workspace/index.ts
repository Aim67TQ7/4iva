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
    
    // Sanitize and validate photos array
    if (!Array.isArray(photos) || photos.length === 0) {
      throw new Error('No photos provided or invalid photos format');
    }

    // Clean and limit photo data
    const processedPhotos = photos.slice(0, 3).map(photo => {
      // Remove any potential problematic characters from base64 strings
      if (typeof photo !== 'string') return '';
      return photo.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    }).filter(photo => photo.length > 0);

    if (processedPhotos.length === 0) {
      throw new Error('No valid photos after processing');
    }

    console.log(`Processing ${processedPhotos.length} photos`);

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

Analyze the provided workspace photos and provide specific, detailed feedback based on visual evidence.`;

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY');
    }

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
        messages: [{
          role: 'user',
          content: `${prompt}\n\nAnalyze these photos: ${processedPhotos.length} workspace photos provided`
        }],
        system: "You are a 5S workplace organization expert. Provide detailed, specific scores and feedback based on visual evidence in workspace photos. Focus on concrete observations and actionable recommendations. Avoid generic language. Always respond with valid JSON containing numerical scores (1-10) for each category and detailed feedback."
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
      const evaluation = JSON.parse(result.content[0].text);
      console.log('Successfully parsed evaluation results');

      // Validate scores
      const baseScore = (evaluation.sortScore || 0) + (evaluation.setInOrderScore || 0) + (evaluation.shineScore || 0);
      if (baseScore < 22) {
        evaluation.standardizeScore = 0;
        evaluation.sustainScore = 0;
      }

      return new Response(
        JSON.stringify(evaluation),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse evaluation result:', parseError);
      throw new Error('Failed to parse evaluation result as JSON');
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