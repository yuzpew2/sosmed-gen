'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

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
        <Input
          placeholder="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          placeholder="Template"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
        />
        <Button type="submit">Save</Button>
      </form>

      <ul className="space-y-4">
        {prompts.map((p) => (
          <li key={p.id} className="border p-4 space-y-2">
            <Input
              value={p.name}
              onChange={(e) =>
                setPrompts((prev) =>
                  prev.map((item) =>
                    item.id === p.id ? { ...item, name: e.target.value } : item
                  )
                )
              }
            />
            <Textarea
              value={p.template}
              onChange={(e) =>
                setPrompts((prev) =>
                  prev.map((item) =>
                    item.id === p.id
                      ? { ...item, template: e.target.value }
                      : item
                  )
                )
              }
            />
            <div className="flex gap-2">
              <Button type="button" variant="success" onClick={() => handleUpdate(p)}>
                Update
              </Button>
              <Button
                type="button"
                variant="error"
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
