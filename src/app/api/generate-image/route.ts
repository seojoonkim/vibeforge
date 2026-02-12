import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { prompt, characterId } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      )
    }

    // Enhance prompt for anime style (Illustrious XL optimized)
    const animePrompt = `${prompt}, masterpiece, best quality, highly detailed, beautiful lighting`
    
    const negativePrompt = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, 3d, realistic, photorealistic'

    // Create prediction with Illustrious XL (niji-style anime model)
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: '87651edd4668d09df2afc9eb5fcdde465fc276f89e3e12b2ff942119077510f1',
        input: { 
          prompt: animePrompt,
          negative_prompt: negativePrompt,
          width: 768,
          height: 1344,
          guidance_scale: 7,
          num_inference_steps: 28
        }
      })
    })

    const prediction = await createRes.json()
    
    if (prediction.error) {
      throw new Error(prediction.error)
    }

    // Poll for completion
    let result = prediction
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(r => setTimeout(r, 1000))
      const pollRes = await fetch(result.urls.get, {
        headers: {
          'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
        }
      })
      result = await pollRes.json()
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Generation failed')
    }

    // Handle both array and string output formats
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output

    // Save to DB if characterId provided
    if (characterId && imageUrl) {
      const supabase = createServerClient()
      await (supabase.from('characters') as any)
        .update({ generated_image: imageUrl })
        .eq('id', characterId)
    }

    return NextResponse.json({ 
      imageUrl,
      characterId 
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Image generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
