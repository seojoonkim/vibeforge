import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET all characters
export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}

// POST create character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, style_prompt, reference_images } = body

    if (!name || !style_prompt) {
      return NextResponse.json(
        { error: 'name and style_prompt are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('characters')
      .insert({
        name,
        description: description || null,
        style_prompt,
        reference_images: reference_images || []
      } as any)
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    )
  }
}
