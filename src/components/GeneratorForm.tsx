// src/components/GeneratorForm.tsx
'use client'

import { useEffect, useState } from 'react'

export default function GeneratorForm() {
  const [niche, setNiche] = useState('')
  const [prompts, setPrompts] = useState<{ id: number; name: string }[]>([])
  const [promptId, setPromptId] = useState<number | null>(null)
  const [generatedPost, setGeneratedPost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false) // <-- TAMBAHAN BARU

  useEffect(() => {
    const fetchPrompts = async () => {
      const res = await fetch('/api/prompts')
      const { prompts: data } = await res.json()
      setPrompts(data)
      if (data.length > 0) {
        setPromptId(data[0].id)
      }
    }

    fetchPrompts()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setGeneratedPost('')

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche, promptId }),
    })

    const data = await response.json()
    setGeneratedPost(data.post)
    setIsLoading(false)
  }

  // FUNGSI BARU UNTUK MENYALIN TEKS
  const handleCopy = () => {
    if (generatedPost) {
      navigator.clipboard.writeText(generatedPost).then(() => {
        setIsCopied(true)
        setTimeout(() => {
          setIsCopied(false)
        }, 2000) // Tukar teks kembali selepas 2 saat
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="niche" className="block text-sm font-medium">Niche/Topik Anda</label>
          <input
            type="text"
            id="niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black p-2"
            placeholder="cth: Makanan sihat untuk atlet"
            required
          />
        </div>
        <div>
          <label htmlFor="promptId" className="block text-sm font-medium">Jenis Gaya Penulisan</label>
          <select
            id="promptId"
            value={promptId ?? ''}
            onChange={(e) => setPromptId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black p-2"
          >
            {prompts.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Menjana...' : 'Jana Posting'}
        </button>
      </form>

      {generatedPost && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Hasil Jana:</h3>
          <textarea
            value={generatedPost}
            onChange={(e) => setGeneratedPost(e.target.value)}
            className="mt-2 block w-full h-48 rounded-md border-gray-300 shadow-sm text-black p-2"
          />
          {/* BUTANG SALIN BARU DI SINI */}
          <button
            type="button"
            onClick={handleCopy}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {isCopied ? 'Tersalin!' : 'Salin Teks'}
          </button>
        </div>
      )}
    </div>
  )
}