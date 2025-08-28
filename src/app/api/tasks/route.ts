export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tasks')
      .select('id, created_at, video_url, prompt_id, status, result, summary')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ tasks: data }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, result, status } = await request.json()
    if (!id || !result || !status) {
      return NextResponse.json({ error: 'ID, result, and status are required' }, { status: 400 })
    }
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tasks')
      .update({ result, status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, created_at, video_url, prompt_id, status, result, summary, updated_at')
      .single()
    if (error) throw error
    return NextResponse.json({ task: data }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
