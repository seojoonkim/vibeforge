import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET single character
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching character:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    )
  }
}

// PUT update character
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, style_prompt, reference_images } = body

    if (!name || !style_prompt) {
      return NextResponse.json(
        { error: 'name and style_prompt are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    const updateData: any = {
      name,
      description: description || null,
      style_prompt
    }
    
    if (reference_images !== undefined) {
      updateData.reference_images = reference_images
    }

    const { data, error } = await (supabase
      .from('characters') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating character:', error)
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    )
  }
}

// DELETE character
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting character:', error)
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    )
  }
}
