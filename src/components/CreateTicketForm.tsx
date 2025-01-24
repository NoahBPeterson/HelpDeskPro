import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function CharacterCount({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let color = 'text-blue-500';
  if (percentage >= 95) color = 'text-red-500';
  else if (percentage >= 80) color = 'text-yellow-500';

  return (
    <div className="relative inline-flex items-center ml-2">
      <svg className="w-5 h-5 transform -rotate-90">
        <circle
          cx="10"
          cy="10"
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className={`${color} transition-all duration-300`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset
          }}
        />
      </svg>
      {percentage >= 80 && (
        <span className={`absolute text-xs -top-5 ${color}`}>
          {max - current}
        </span>
      )}
    </div>
  );
}

export function CreateTicketForm({ onSuccess }: { onSuccess?: () => void }) {
  const { session } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!session) throw new Error('No session found')
      // First get the user's workspace_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('id', session.user.id)
        .single()

      if (userError) throw userError
      if (!userData?.workspace_id) throw new Error('No workspace found')

      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          title,
          description,
          priority,
          workspace_id: userData.workspace_id,
          created_by_user_id: session?.user.id,
        })

      if (ticketError) throw ticketError

      // Clear form and notify parent
      setTitle('')
      setDescription('')
      setPriority('low')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <div className="relative">
          <input
            type="text"
            id="title"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Brief description of the issue"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <CharacterCount current={title.length} max={80} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="relative">
          <textarea
            id="description"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-8"
            placeholder="Detailed explanation of the issue"
          />
          <div className="absolute right-2 top-2">
            <CharacterCount current={description.length} max={2000} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </div>
    </form>
  )
} 