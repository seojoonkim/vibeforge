import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET all tracks
export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await (supabase
      .from('tracks') as any)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return NextResponse.json(data)
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
    const { title, genre, lyrics, prompt, audio_url } = body

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data, error } = await (supabase
      .from('tracks') as any)
      .insert({
        title,
        genre,
        lyrics,
        prompt,
        audio_url
      })
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating track:', error)
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    )
  }
}
