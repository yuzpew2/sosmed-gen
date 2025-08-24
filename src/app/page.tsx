// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GeneratorForm from '@/components/GeneratorForm' // Import komponen baru

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="w-full max-w-2xl flex justify-between items-center">
        <p className="text-sm">Helo, {data.user.email}</p>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded">
            Sign out
          </button>
        </form>
      </div>

      <h1 className="text-3xl font-bold mt-8 mb-4">Sosmed Gen</h1>
      <p className="mb-8">Masukkan niche anda dan pilih gaya penulisan untuk menjana posting media sosial.</p>

      {/* Paparkan Borang Penjana Di Sini */}
      <GeneratorForm />
    </div>
  )
}