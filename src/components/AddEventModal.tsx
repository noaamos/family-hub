'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { EVENT_CATEGORIES, detectEventCategory } from '@/lib/eventCategories'

type Props = {
  defaultDate?: Date
  onClose: () => void
  onCreated: () => void
}

export default function AddEventModal({ defaultDate, onClose, onCreated }: Props) {
  const today = defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [allDay, setAllDay] = useState(false)
  const [recurring, setRecurring] = useState('')
  const [manualCategoryId, setManualCategoryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const detectedCategory = useMemo(
    () => (title.trim() ? detectEventCategory(title) : null),
    [title]
  )

  const activeCategory = manualCategoryId
    ? EVENT_CATEGORIES.find((c) => c.id === manualCategoryId)!
    : detectedCategory

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const color = activeCategory?.color ?? '#E5E7EB'
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        startDate,
        endDate,
        allDay,
        recurring: recurring || null,
        color,
      }),
    })
    setLoading(false)
    if (res.ok) {
      onCreated()
      onClose()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create event')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">הוסף אירוע</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title with live category badge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם האירוע</label>
            <div className="relative">
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setManualCategoryId(null) }}
                required
                dir="auto"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-3"
                placeholder="למשל: פילאטיס, יום הולדת..."
              />
            </div>

            {/* Live detected category */}
            {activeCategory && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">
                  {manualCategoryId ? 'קטגוריה:' : 'זוהה אוטומטית:'}
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: activeCategory.color, color: activeCategory.textColor }}
                >
                  {activeCategory.emoji} {activeCategory.label}
                </span>
              </div>
            )}
          </div>

          {/* Category selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_CATEGORIES.map((cat) => {
                const isActive = activeCategory?.id === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setManualCategoryId(cat.id === activeCategory?.id && manualCategoryId ? null : cat.id)}
                    className="text-xs px-2.5 py-1 rounded-full border-2 transition font-medium"
                    style={{
                      backgroundColor: isActive ? cat.color : 'transparent',
                      borderColor: cat.color,
                      color: isActive ? cat.textColor : '#6B7280',
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              dir="auto"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="תיאור אופציונלי"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">כל היום</label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">התחלה</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startDate.slice(0, 10) : startDate}
                onChange={(e) => setStartDate(allDay ? e.target.value + 'T00:00' : e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיום</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endDate.slice(0, 10) : endDate}
                onChange={(e) => setEndDate(allDay ? e.target.value + 'T23:59' : e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">חזרה</label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">ללא חזרה</option>
              <option value="daily">כל יום</option>
              <option value="weekly">כל שבוע</option>
              <option value="monthly">כל חודש</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-60"
              style={{ backgroundColor: activeCategory?.color ? activeCategory.color : '#6366F1', color: activeCategory?.textColor ?? 'white' }}
            >
              {loading ? 'שומר...' : 'הוסף אירוע'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
