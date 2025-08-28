// src/components/GeneratorForm.tsx
'use client'

import { useEffect, useState } from 'react'

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1)
    }
    return parsed.searchParams.get('v')
  } catch {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:&|$)/)
    return match ? match[1] : null
  }
}

export default function GeneratorForm() {
  const [videoUrl, setVideoUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<{ id: number; name: string }[]>([])
  const [promptId, setPromptId] = useState<number | null>(null)
  const [generatedPost, setGeneratedPost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false) // <-- TAMBAHAN BARU
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!taskId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transcribe?taskId=${taskId}`)
        const data = await res.json()
        if (data.status === 'completed') {
          setSummary(data.summary)
          clearInterval(interval)
          setTaskId(null)
        } else if (data.status === 'failed') {
          console.error('Transcription failed')
          clearInterval(interval)
          setTaskId(null)
          setIsLoading(false)
        }
      } catch (err) {
        console.error(err)
        clearInterval(interval)
        setTaskId(null)
        setIsLoading(false)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [taskId])

  useEffect(() => {
    if (!summary) return
    const generatePost = async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche: summary, promptId }),
        })
        if (!response.ok) {
          setError('Failed to generate post')
          return
        }
        const data = await response.json()
        setGeneratedPost(data.post)

        try {
          await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: data.post, status: 'draft' }),
          })
        } catch (err) {
          console.error(err)
        }
      } catch (err) {
        console.error(err)
        setError('Failed to generate post')
      } finally {
        setIsLoading(false)
      }
    }
    generatePost()
  }, [summary, promptId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setGeneratedPost('')
    setSummary('')
    setError(null)

    try {
      const videoId = extractVideoId(videoUrl)
      if (!videoId) {
        throw new Error('Invalid YouTube URL')
      }
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, promptId }),
      })
      const data = await response.json()
      setTaskId(data.taskId)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
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
          <label htmlFor="videoUrl" className="block text-sm font-medium">YouTube URL</label>
          <input
            type="text"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black p-2"
            placeholder="https://www.youtube.com/watch?v=example"
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

      {error && <p className="mt-4 text-red-500">{error}</p>}

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
