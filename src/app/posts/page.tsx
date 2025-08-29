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
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editResult, setEditResult] = useState('')
  const [editStatus, setEditStatus] = useState('draft')
  const [expandedId, setExpandedId] = useState<number | null>(null)

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
    setEditingTask(task)
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
      setEditingTask(null)
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
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>

      {/* Desktop table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Video URL</th>
              <th className="p-2 text-left">Prompt</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Summary</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <>
                <tr key={task.id} className="border-t">
                  <td className="p-2 break-words">{task.videoUrl}</td>
                  <td className="p-2">{task.prompt_id}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 text-sm bg-gray-200 rounded">
                      {task.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {(task.summary?.length ?? 0) > 50
                      ? (task.summary ?? '').slice(0, 50) + '…'
                      : task.summary ?? ''}
                  </td>
                  <td className="p-2 space-x-2 whitespace-nowrap">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === task.id ? null : task.id)
                      }
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      {expandedId === task.id ? 'Hide' : 'View'}
                    </button>
                    <button
                      onClick={() => startEditing(task)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {expandedId === task.id && (
                  <tr className="border-t" key={`${task.id}-expanded`}>
                    <td colSpan={5} className="p-2">
                      <p className="whitespace-pre-wrap">{task.result}</p>
                      <p className="mt-2 whitespace-pre-wrap">{task.summary}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(task.result)}
                        className="mt-2 bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="border p-4 rounded">
            <p className="break-words">
              <span className="font-semibold">Video:</span> {task.videoUrl}
            </p>
            <p>
              <span className="font-semibold">Prompt:</span> {task.prompt_id}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              <span className="px-2 py-1 text-sm bg-gray-200 rounded">
                {task.status}
              </span>
            </p>
            <p>
              <span className="font-semibold">Summary:</span>{' '}
              {(task.summary?.length ?? 0) > 50
                ? (task.summary ?? '').slice(0, 50) + '…'
                : task.summary ?? ''}
            </p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() =>
                  setExpandedId(expandedId === task.id ? null : task.id)
                }
                className="bg-blue-600 text-white px-2 py-1 rounded"
              >
                {expandedId === task.id ? 'Hide' : 'View'}
              </button>
              <button
                onClick={() => startEditing(task)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
            {expandedId === task.id && (
              <div className="mt-2">
                <p className="whitespace-pre-wrap">{task.result}</p>
                <p className="mt-2 whitespace-pre-wrap">{task.summary}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(task.result)}
                  className="mt-2 bg-green-600 text-white px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">Edit Task</h2>
            <p className="break-words">{editingTask.videoUrl}</p>
            <p className="mt-1">Prompt: {editingTask.prompt_id}</p>
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
            <p className="mt-2 whitespace-pre-wrap">{editingTask.summary}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleUpdate(editingTask.id)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTask(null)}
                className="bg-gray-300 text-black px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
