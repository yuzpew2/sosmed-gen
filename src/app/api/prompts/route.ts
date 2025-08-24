import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: prompts, error } = await supabase.from('prompts').select('*')
    if (error) {
      throw error
    }
    return NextResponse.json(prompts)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, prompt } = await request.json()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prompts')
      .insert({ name, prompt })
      .select()
      .single()
    if (error) {
      throw error
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, prompt } = await request.json()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prompts')
      .update({ name, prompt })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      throw error
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const supabase = await createClient()
    const { error } = await supabase.from('prompts').delete().eq('id', id)
    if (error) {
      throw error
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
  }
}
