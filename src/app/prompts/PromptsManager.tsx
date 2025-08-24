'use client'

import { useState } from 'react'

interface Prompt {
  id: number
  name: string
  template: string
}

export default function PromptsManager({ initialPrompts }: { initialPrompts: Prompt[] }) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
  const [name, setName] = useState('')
  const [promptText, setPromptText] = useState('')

  const refreshPrompts = async () => {
    const res = await fetch('/api/prompts')
    if (res.ok) {
      const { prompts: data } = await res.json()
      setPrompts(data)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, template: promptText }),
    })
    setName('')
    setPromptText('')
    refreshPrompts()
  }

  const handleUpdate = async (p: Prompt) => {
    const { id, name, template } = p
    await fetch('/api/prompts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, template }),
    })
    refreshPrompts()
  }

  const handleDelete = async (id: number) => {
    await fetch('/api/prompts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    refreshPrompts()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Template"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>

      <ul className="space-y-4">
        {prompts.map((p) => (
          <li key={p.id} className="border p-4 space-y-2">
            <input
              className="border p-2 w-full"
              value={p.name}
              onChange={(e) =>
                setPrompts((prev) =>
                  prev.map((item) =>
                    item.id === p.id ? { ...item, name: e.target.value } : item
                  )
                )
              }
            />
            <textarea
              className="border p-2 w-full"
              value={p.template}
              onChange={(e) =>
                setPrompts((prev) =>
                  prev.map((item) =>
                    item.id === p.id ? { ...item, template: e.target.value } : item
                  )
                )
              }
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => handleUpdate(p)}
              >
                Update
              </button>
              <button
                type="button"
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
