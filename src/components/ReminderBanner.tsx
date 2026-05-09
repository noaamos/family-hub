'use client'

import { useState, useEffect } from 'react'
import { parseISO, differenceInHours, format } from 'date-fns'

type Event = { id: string; title: string; startDate: string; allDay: boolean }
type Chore = { id: string; title: string; dueDate?: string; completed: boolean; assignee?: { id: string } }

export default function ReminderBanner({ userId }: { userId: string }) {
  const [reminders, setReminders] = useState<string[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function check() {
      const [evRes, chRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/chores'),
      ])
      const events: Event[] = evRes.ok ? await evRes.json() : []
      const chores: Chore[] = chRes.ok ? await chRes.json() : []
      const now = new Date()

      const msgs: string[] = []

      events.forEach((e) => {
        const start = parseISO(e.startDate)
        const hours = differenceInHours(start, now)
        if (hours >= 0 && hours <= 24) {
          msgs.push(`"${e.title}" ${e.allDay ? 'is today' : `starts at ${format(start, 'h:mm a')}`}`)
        }
      })

      chores.forEach((c) => {
        if (c.completed) return
        if (c.assignee && c.assignee.id !== userId) return
        if (!c.dueDate) return
        const due = parseISO(c.dueDate)
        const hours = differenceInHours(due, now)
        if (hours >= -24 && hours <= 24) {
          msgs.push(`Chore "${c.title}" is due today`)
        }
      })

      setReminders(msgs)
    }
    check()
  }, [userId])

  if (reminders.length === 0 || dismissed) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-3">
      <span className="text-amber-500 text-lg">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800 mb-1">Today&apos;s reminders</p>
        <ul className="space-y-0.5">
          {reminders.map((r, i) => (
            <li key={i} className="text-xs text-amber-700">{r}</li>
          ))}
        </ul>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600 text-lg leading-none flex-shrink-0">×</button>
    </div>
  )
}
