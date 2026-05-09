'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { EVENT_CATEGORIES, detectEventCategory } from '@/lib/eventCategories'

type EventForEdit = {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  allDay: boolean
  recurring?: string
  color?: string
}

type Props = {
  defaultDate?: Date
  editEvent?: EventForEdit
  onClose: () => void
  onCreated: () => void
}

export default function AddEventModal({ defaultDate, editEvent, onClose, onCreated }: Props) {
  const today = defaultDate ? format(defaultDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const initialCategory = editEvent?.color
    ? (EVENT_CATEGORIES.find(c => c.color === editEvent.color)?.id ?? null)
    : null

  const [title, setTitle] = useState(editEvent?.title ?? '')
  const [description, setDescription] = useState(editEvent?.description ?? '')
  const [startDate, setStartDate] = useState(
    editEvent ? editEvent.startDate.slice(0, 16) : today
  )
  const [endDate, setEndDate] = useState(
    editEvent ? editEvent.endDate.slice(0, 16) : today
  )
  const [allDay, setAllDay] = useState(editEvent?.allDay ?? false)
  const [recurring, setRecurring] = useState(editEvent?.recurring ?? '')
  const [manualCategoryId, setManualCategoryId] = useState<string | null>(initialCategory)
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
    const url = editEvent ? `/api/events/${editEvent.id}` : '/api/events'
    const method = editEvent ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
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
      setError(data.error || (editEvent ? 'Failed to update event' : 'Failed to create event'))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-100" onClick={(e) => e.stopPropagation()}>

        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span style={{ fontFamily: 'var(--font-bebas)' }} className="text-2xl tracking-widest text-gray-900 leading-none">
              {editEvent ? 'EDIT' : 'NEW'}
            </span>
            <span style={{ fontFamily: 'var(--font-dancing)' }} className="text-xl text-rose-400 leading-none pb-0.5">
              {editEvent ? 'אירוע' : 'אירוע'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none transition">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">שם האירוע</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setManualCategoryId(null) }}
              required
              dir="auto"
              className="w-full border border-rose-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50/30 placeholder:text-gray-300"
              placeholder="למשל: פילאטיס, יום הולדת..."
            />
            {activeCategory && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">{manualCategoryId ? 'קטגוריה:' : 'זוהה אוטומטית:'}</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: activeCategory.color, color: activeCategory.textColor }}
                >
                  {activeCategory.emoji} {activeCategory.label}
                </span>
              </div>
            )}
          </div>

          {/* Category selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">קטגוריה</label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_CATEGORIES.map((cat) => {
                const isActive = activeCategory?.id === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setManualCategoryId(cat.id === activeCategory?.id && manualCategoryId ? null : cat.id)}
                    className="text-xs px-2.5 py-1 rounded-full border-2 transition font-semibold"
                    style={{
                      backgroundColor: isActive ? cat.color : 'transparent',
                      borderColor: cat.color,
                      color: isActive ? cat.textColor : '#9CA3AF',
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">תיאור</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              dir="auto"
              className="w-full border border-rose-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50/30 resize-none placeholder:text-gray-300"
              placeholder="תיאור אופציונלי"
            />
          </div>

          {/* All day */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-rose-300 accent-rose-400"
            />
            <label htmlFor="allDay" className="text-sm text-gray-600">כל היום</label>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">התחלה</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startDate.slice(0, 10) : startDate}
                onChange={(e) => setStartDate(allDay ? e.target.value + 'T00:00' : e.target.value)}
                required
                className="w-full border border-rose-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">סיום</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endDate.slice(0, 10) : endDate}
                onChange={(e) => setEndDate(allDay ? e.target.value + 'T23:59' : e.target.value)}
                required
                className="w-full border border-rose-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50/30"
              />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">חזרה</label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
              className="w-full border border-rose-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50/30"
            >
              <option value="">ללא חזרה</option>
              <option value="daily">כל יום</option>
              <option value="weekly">כל שבוע</option>
              <option value="monthly">כל חודש</option>
            </select>
          </div>

          {error && <p className="text-rose-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl py-2 text-sm font-bold transition disabled:opacity-60 bg-gray-900 text-white hover:bg-gray-700 shadow-sm"
            >
              {loading ? 'שומר...' : editEvent ? 'שמור שינויים' : '🌷 הוסף אירוע'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
