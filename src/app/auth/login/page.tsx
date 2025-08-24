// src/app/auth/login/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/')
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', paddingTop: '100px' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        redirectTo={`${location.origin}/auth/callback`}
      />
    </div>
  )
}