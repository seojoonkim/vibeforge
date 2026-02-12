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

    // Enhance prompt for anime style
    const animePrompt = `${prompt}, masterpiece, best quality, 2d anime style, anime key visual, Japanese anime, cel shading, clean lineart, vibrant colors, by A-1 Pictures, studio quality`
    
    const negativePrompt = 'photorealistic, 3d render, realistic, photograph, bad anatomy, blurry, low quality, worst quality, ugly, deformed'

    // Create prediction with stability-ai/sdxl (better for anime with right prompts)
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: { 
          prompt: animePrompt,
          negative_prompt: negativePrompt,
          width: 1024,
          height: 1024,
          num_outputs: 1
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

    const imageUrl = result.output?.[0]

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
