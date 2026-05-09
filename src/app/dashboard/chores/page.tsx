'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import AddChoreModal from '@/components/AddChoreModal'

type Member = { id: string; name: string; color: string }
type Chore = {
  id: string
  title: string
  description?: string
  dueDate?: string
  recurring?: string
  completed: boolean
  completedAt?: string
  assignee?: Member
  creator: Member
}

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([])
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'mine' | 'pending'>('all')
  const [me, setMe] = useState<{ id: string } | null>(null)

  const fetchChores = useCallback(async () => {
    const res = await fetch('/api/chores')
    if (res.ok) setChores(await res.json())
  }, [])

  useEffect(() => {
    fetchChores()
    fetch('/api/auth/me').then((r) => r.json()).then(setMe)
  }, [fetchChores])

  async function toggleChore(id: string) {
    await fetch(`/api/chores/${id}/complete`, { method: 'POST' })
    fetchChores()
  }

  async function deleteChore(id: string) {
    await fetch(`/api/chores/${id}`, { method: 'DELETE' })
    fetchChores()
  }

  const filtered = chores.filter((c) => {
    if (filter === 'mine') return c.assignee?.id === me?.id
    if (filter === 'pending') return !c.completed
    return true
  })

  const pending = filtered.filter((c) => !c.completed)
  const done = filtered.filter((c) => c.completed)

  function dueBadge(chore: Chore) {
    if (!chore.dueDate || chore.completed) return null
    const d = parseISO(chore.dueDate)
    if (isToday(d)) return <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Due today</span>
    if (isPast(d)) return <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Overdue</span>
    return <span className="text-xs text-gray-400">{format(d, 'MMM d')}</span>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Chores</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
        >
          + Add Chore
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'mine'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Mine'}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">
          {pending.length} pending
        </span>
      </div>

      <div className="space-y-2">
        {pending.length === 0 && done.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">✅</div>
            <p>No chores yet</p>
          </div>
        )}

        {pending.map((chore) => (
          <ChoreCard key={chore.id} chore={chore} onToggle={toggleChore} onDelete={deleteChore} badge={dueBadge(chore)} />
        ))}

        {done.length > 0 && (
          <>
            <div className="text-xs font-medium text-gray-400 pt-4 pb-1">Completed</div>
            {done.map((chore) => (
              <ChoreCard key={chore.id} chore={chore} onToggle={toggleChore} onDelete={deleteChore} badge={dueBadge(chore)} />
            ))}
          </>
        )}
      </div>

      {showModal && <AddChoreModal onClose={() => setShowModal(false)} onCreated={fetchChores} />}
    </div>
  )
}

function ChoreCard({
  chore,
  onToggle,
  onDelete,
  badge,
}: {
  chore: Chore
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  badge: React.ReactNode
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 ${chore.completed ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onToggle(chore.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
          chore.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {chore.completed && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium text-sm text-gray-900 ${chore.completed ? 'line-through' : ''}`}>
            {chore.title}
          </span>
          {badge}
          {chore.recurring && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
              {chore.recurring}
            </span>
          )}
        </div>
        {chore.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{chore.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          {chore.assignee ? (
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                style={{ backgroundColor: chore.assignee.color }}
              >
                {chore.assignee.name[0]}
              </div>
              <span className="text-xs text-gray-400">{chore.assignee.name}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-300">Unassigned</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(chore.id)}
        className="text-gray-300 hover:text-red-400 transition text-sm flex-shrink-0 mt-0.5"
      >
        ×
      </button>
    </div>
  )
}
