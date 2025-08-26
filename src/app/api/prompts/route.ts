import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_TEMPLATE_LENGTH = 2000

function sanitizeTemplate(input: string) {
  const withoutScripts = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  return withoutScripts
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('prompts').select('*')
    if (error) throw error

    return NextResponse.json({ prompts: data }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, template } = await request.json()
    if (!name || !template) {
      return NextResponse.json({ error: 'Name and template are required' }, { status: 400 })
    }
    if (template.length > MAX_TEMPLATE_LENGTH) {
      return NextResponse.json(
        { error: 'Template exceeds maximum length' },
        { status: 400 }
      )
    }

    const sanitizedTemplate = sanitizeTemplate(template)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prompts')
      .insert({ name, template: sanitizedTemplate })
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ template: data }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, template } = await request.json()
    if (!id || !name || !template) {
      return NextResponse.json({ error: 'ID, name, and template are required' }, { status: 400 })
    }
    if (template.length > MAX_TEMPLATE_LENGTH) {
      return NextResponse.json(
        { error: 'Template exceeds maximum length' },
        { status: 400 }
      )
    }

    const sanitizedTemplate = sanitizeTemplate(template)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prompts')
      .update({ name, template: sanitizedTemplate })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ template: data }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('prompts').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
  }
}
