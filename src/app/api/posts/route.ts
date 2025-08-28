export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ posts: data }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { content, status } = await request.json()
    if (!content || !status) {
      return NextResponse.json({ error: 'Content and status are required' }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase.from('posts').insert({ content, status }).select().single()
    if (error) throw error
    return NextResponse.json({ post: data }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, content, status } = await request.json()
    if (!id || !content || !status) {
      return NextResponse.json({ error: 'ID, content, and status are required' }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .update({ content, status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ post: data }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    const supabase = await createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
