import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET all videos
export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await (supabase
      .from('videos') as any)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

// POST create video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, scene_prompt, resolution } = body

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data, error } = await (supabase
      .from('videos') as any)
      .insert({
        title,
        scene_prompt,
        resolution: resolution || '1080p',
        status: 'draft'
      })
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
