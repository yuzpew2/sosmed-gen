import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PromptsManager from './PromptsManager'

export default async function PromptsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  // Optional admin-only access
  if (data.user.user_metadata?.role !== 'admin') {
    redirect('/')
  }

  const { data: prompts } = await supabase.from('prompts').select('*')

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Prompts</h1>
      <PromptsManager initialPrompts={prompts || []} />
    </div>
  )
}
