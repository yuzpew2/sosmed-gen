'use client'

import { useEffect, useState } from 'react'

type Task = {
  id: number
  created_at: string
  videoUrl: string
  prompt_id: number
  status: string
  result: string
  summary: string
}

type RawTask = Omit<Task, 'videoUrl'> & { video_url: string }

export default function PostsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editResult, setEditResult] = useState('')
  const [editStatus, setEditStatus] = useState('draft')

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', { cache: 'no-store' })
      const data = await res.json()
      const tasks = (data.tasks || []).map((t: RawTask): Task => ({
        ...t,
        videoUrl: t.video_url,
      }))
      setTasks(tasks)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const startEditing = (task: Task) => {
    setEditingId(task.id)
    setEditResult(task.result)
    setEditStatus(task.status)
  }

  const handleUpdate = async (id: number) => {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, result: editResult, status: editStatus }),
      })
      setEditingId(null)
      await fetchTasks()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await fetchTasks()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      {tasks.map((task) => (
        <div key={task.id} className="border p-4 mb-4 rounded">
          {editingId === task.id ? (
            <>
              <p className="break-words">{task.videoUrl}</p>
              <p className="mt-1">Prompt: {task.prompt_id}</p>
              <textarea
                className="w-full rounded text-black p-2 mt-2"
                value={editResult}
                onChange={(e) => setEditResult(e.target.value)}
              />
              <select
                className="mt-2 p-2 rounded text-black"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="draft">draft</option>
                <option value="posted">posted</option>
              </select>
              <p className="mt-2 whitespace-pre-wrap">{task.summary}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleUpdate(task.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-300 text-black px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="break-words">{task.videoUrl}</p>
              <p>Prompt: {task.prompt_id}</p>
              <p className="mt-2 whitespace-pre-wrap">{task.result}</p>
              <span className="inline-block mt-2 px-2 py-1 text-sm bg-gray-200 rounded">
                {task.status}
              </span>
              <p className="mt-2 whitespace-pre-wrap">{task.summary}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => startEditing(task)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(task.result)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
