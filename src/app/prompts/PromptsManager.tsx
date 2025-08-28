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
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editTemplate, setEditTemplate] = useState('')
  const [search, setSearch] = useState('')

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
    setIsCreating(false)
    refreshPrompts()
  }

  const startEdit = (p: Prompt) => {
    setEditingId(p.id)
    setEditName(p.name)
    setEditTemplate(p.template)
  }

  const handleEditSave = async (id: number) => {
    await fetch('/api/prompts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName, template: editTemplate }),
    })
    setEditingId(null)
    setEditName('')
    setEditTemplate('')
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

  const truncate = (str: string, max = 80) =>
    str.length > max ? `${str.slice(0, max)}...` : str

  const filteredPrompts = prompts.filter((p) => {
    const term = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(term) ||
      p.template.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          className="border p-2 flex-1"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setIsCreating(true)}
        >
          Create Prompt
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="space-y-2 border p-4 rounded">
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
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => {
                setIsCreating(false)
                setName('')
                setPromptText('')
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-4">
        {filteredPrompts.map((p) => (
          <li key={p.id} className="border p-4 space-y-2 rounded">
            {editingId === p.id ? (
              <div className="space-y-2">
                <input
                  className="border p-2 w-full"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <textarea
                  className="border p-2 w-full"
                  value={editTemplate}
                  onChange={(e) => setEditTemplate(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleEditSave(p.id)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {truncate(p.template)}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
