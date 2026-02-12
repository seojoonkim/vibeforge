import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

// Replicate models for different tasks
export const MODELS = {
  // Image generation
  flux: 'black-forest-labs/flux-schnell',
  sdxl: 'stability-ai/sdxl',
  
  // Video generation
  wan: 'wan-video/wan-2.1-i2v-480p',
  minimax: 'minimax/video-01',
  
  // Lip sync
  sadtalker: 'cjwbw/sadtalker',
  wav2lip: 'devxpy/wav2lip',
  
  // Audio
  musicgen: 'meta/musicgen',
}

export async function POST(request: NextRequest) {
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: 'REPLICATE_API_TOKEN not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { model, input } = body

    if (!model || !input) {
      return NextResponse.json(
        { error: 'model and input are required' },
        { status: 400 }
      )
    }

    // Create prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait' // Wait for result (up to 60s)
      },
      body: JSON.stringify({
        version: model,
        input
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Replicate API error' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Replicate API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get prediction status
export async function GET(request: NextRequest) {
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: 'REPLICATE_API_TOKEN not configured' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'prediction id is required' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Replicate API error' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Replicate API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
