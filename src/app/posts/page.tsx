'use client'

import { useEffect, useState } from 'react'

type Post = {
  id: number
  content: string
  status: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editStatus, setEditStatus] = useState('draft')

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts', { cache: 'no-store' })
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const startEditing = (post: Post) => {
    setEditingId(post.id)
    setEditContent(post.content)
    setEditStatus(post.status)
  }

  const handleUpdate = async (id: number) => {
    try {
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: editContent, status: editStatus }),
      })
      setEditingId(null)
      await fetchPosts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await fetchPosts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-4 rounded">
          {editingId === post.id ? (
            <>
              <textarea
                className="w-full rounded text-black p-2"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <select
                className="mt-2 p-2 rounded text-black"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="draft">draft</option>
                <option value="posted">posted</option>
              </select>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleUpdate(post.id)}
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
              <p className="whitespace-pre-wrap">{post.content}</p>
              <span className="inline-block mt-2 px-2 py-1 text-sm bg-gray-200 rounded">
                {post.status}
              </span>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => startEditing(post)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleCopy(post.content)}
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
