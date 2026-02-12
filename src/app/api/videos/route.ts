import { NextRequest, NextResponse } from 'next/server'
// import { createServerClient } from '@/lib/supabase'

// GET all videos
export async function GET() {
  try {
    // TODO: Uncomment when Supabase is configured
    // const supabase = createServerClient()
    // const { data, error } = await supabase
    //   .from('videos')
    //   .select('*, tracks(title), characters(name)')
    //   .order('created_at', { ascending: false })
    
    // if (error) throw error
    // return NextResponse.json(data)
    
    return NextResponse.json([])
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
    const { title, track_id, character_id, project_id, resolution } = body

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    // TODO: Uncomment when Supabase is configured
    // const supabase = createServerClient()
    // const { data, error } = await supabase
    //   .from('videos')
    //   .insert({
    //     title,
    //     track_id,
    //     character_id,
    //     project_id,
    //     resolution: resolution || '1080p',
    //     status: 'draft'
    //   })
    //   .select()
    //   .single()
    
    // if (error) throw error
    // return NextResponse.json(data)

    // Mock response
    return NextResponse.json({
      id: crypto.randomUUID(),
      title,
      track_id,
      character_id,
      project_id,
      resolution: resolution || '1080p',
      status: 'draft',
      storyboard: [],
      clips: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
