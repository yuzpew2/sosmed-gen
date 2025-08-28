// src/components/GeneratorForm.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Select from './ui/Select'

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
  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<{ id: number; name: string }[]>([])
  const [promptId, setPromptId] = useState<number | null>(null)
  const [generatedText, setGeneratedText] = useState('')
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
    const generateText = async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche: summary, promptId }),
        })
        if (!response.ok) {
          setError('Failed to generate text')
          return
        }
        const data = await response.json()
        setGeneratedText(data.post)

        if (taskId) {
          await fetch('/api/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId, result: data.post, status: 'draft' }),
          })
          router.refresh()
        }

      } catch (err) {
        console.error(err)
        setError('Failed to generate text')
      } finally {
        setIsLoading(false)
      }
    }
    generateText()
  }, [summary, promptId, taskId, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setGeneratedText('')
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
    if (generatedText) {
      navigator.clipboard.writeText(generatedText).then(() => {
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
          <label htmlFor="videoUrl" className="block text-sm font-medium">
            YouTube URL
          </label>
          <Input
            type="text"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="mt-1"
            placeholder="https://www.youtube.com/watch?v=example"
            required
          />
        </div>
        <div>
          <label htmlFor="promptId" className="block text-sm font-medium">
            Jenis Gaya Penulisan
          </label>
          <Select
            id="promptId"
            value={promptId ?? ''}
            onChange={(e) => setPromptId(Number(e.target.value))}
            className="mt-1"
          >
            {prompts.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Menjana...' : 'Jana Teks'}
        </Button>
      </form>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {generatedText && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Hasil Jana:</h3>
          <Textarea
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            className="mt-2 h-48"
          />
          {/* BUTANG SALIN BARU DI SINI */}
          <Button
            type="button"
            onClick={handleCopy}
            variant="success"
            className="mt-2"
          >
            {isCopied ? 'Tersalin!' : 'Salin Teks'}
          </Button>
        </div>
      )}
    </div>
  )
}
