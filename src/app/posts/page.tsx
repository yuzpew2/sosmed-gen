'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      {tasks.map((task) => (
        <div key={task.id} className="card bg-base-100 shadow p-4 mb-4">
          {editingId === task.id ? (
            <>
              <p className="break-words">{task.videoUrl}</p>
              <p className="mt-1">Prompt: {task.prompt_id}</p>
              <Textarea
                className="mt-2"
                value={editResult}
                onChange={(e) => setEditResult(e.target.value)}
              />
              <Select
                className="mt-2"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="draft">draft</option>
                <option value="posted">posted</option>
              </Select>
              <p className="mt-2 whitespace-pre-wrap">{task.summary}</p>
              <div className="mt-2 space-x-2">
                <Button onClick={() => handleUpdate(task.id)}>Save</Button>
                <Button
                  onClick={() => setEditingId(null)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="break-words">{task.videoUrl}</p>
              <p>Prompt: {task.prompt_id}</p>
              <p className="mt-2 whitespace-pre-wrap">{task.result}</p>
              <span className="badge mt-2">{task.status}</span>
              <p className="mt-2 whitespace-pre-wrap">{task.summary}</p>
              <div className="mt-2 space-x-2">
                <Button
                  onClick={() => startEditing(task)}
                  variant="warning"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(task.id)}
                  variant="error"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => navigator.clipboard.writeText(task.result)}
                  variant="success"
                >
                  Copy
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
