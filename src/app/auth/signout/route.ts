import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // This will now work correctly
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/auth/login', request.url), {
    status: 302,
  })
}