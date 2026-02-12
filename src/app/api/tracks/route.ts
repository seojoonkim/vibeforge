import { NextRequest, NextResponse } from 'next/server'
// import { createServerClient } from '@/lib/supabase'

// GET all tracks
export async function GET() {
  try {
    // TODO: Uncomment when Supabase is configured
    // const supabase = createServerClient()
    // const { data, error } = await supabase
    //   .from('tracks')
    //   .select('*, characters(name)')
    //   .order('created_at', { ascending: false })
    
    // if (error) throw error
    // return NextResponse.json(data)
    
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    )
  }
}

// POST create track
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, genre, lyrics, prompt, audio_url, character_id, project_id } = body

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    // TODO: Uncomment when Supabase is configured
    // const supabase = createServerClient()
    // const { data, error } = await supabase
    //   .from('tracks')
    //   .insert({
    //     title,
    //     genre,
    //     lyrics,
    //     prompt,
    //     audio_url,
    //     character_id,
    //     project_id
    //   })
    //   .select()
    //   .single()
    
    // if (error) throw error
    // return NextResponse.json(data)

    // Mock response
    return NextResponse.json({
      id: crypto.randomUUID(),
      title,
      genre,
      lyrics,
      prompt,
      audio_url,
      character_id,
      project_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating track:', error)
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    )
  }
}
