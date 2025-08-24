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
