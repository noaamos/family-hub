'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
  isWithinInterval,
} from 'date-fns'
import AddEventModal from '@/components/AddEventModal'
import { EVENT_CATEGORIES, detectEventCategory } from '@/lib/eventCategories'

type Creator = { id: string; name: string; color: string }
type Event = {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  allDay: boolean
  recurring?: string
  color?: string
  creator: Creator
}

const DAY_HEADERS = [
  { label: 'א׳', color: 'text-rose-400' },
  { label: 'ב׳', color: 'text-orange-400' },
  { label: 'ג׳', color: 'text-amber-500' },
  { label: 'ד׳', color: 'text-emerald-500' },
  { label: 'ה׳', color: 'text-teal-500' },
  { label: 'ו׳', color: 'text-blue-400' },
  { label: 'ש׳', color: 'text-violet-500' },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const fetchEvents = useCallback(async () => {
    const res = await fetch('/api/events')
    if (res.ok) setEvents(await res.json())
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function eventsForDay(day: Date) {
    return events.filter((e) => {
      const start = parseISO(e.startDate)
      const end = parseISO(e.endDate)
      return isWithinInterval(day, { start, end }) || isSameDay(day, start)
    })
  }

  async function deleteEvent(id: string) {
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    setSelectedEvent(null)
    fetchEvents()
  }

  const upcomingEvents = events
    .filter((e) => parseISO(e.startDate) >= new Date())
    .slice(0, 5)

  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* ── Calendar ── */}
      <div className="flex-1">
        <div className="bg-white/90 rounded-3xl shadow-md border border-rose-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-violet-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌸</span>
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition text-lg font-bold"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-white/80 text-rose-500 hover:bg-rose-50 border border-rose-200 transition"
              >
                היום
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-violet-100 text-violet-400 hover:text-violet-600 transition text-lg font-bold"
              >
                ›
              </button>
              <button
                onClick={() => { setSelectedDate(undefined); setShowModal(true) }}
                className="ml-1 bg-gradient-to-r from-rose-400 to-violet-500 hover:from-rose-500 hover:to-violet-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition shadow-sm"
              >
                + אירוע
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-rose-50 via-pink-50 to-violet-50 border-b border-rose-100">
            {DAY_HEADERS.map((d) => (
              <div key={d.label} className={`py-2.5 text-center text-xs font-bold tracking-wide ${d.color}`}>
                {d.label}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayEvents = eventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const todayDay = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => { setSelectedDate(day); setShowModal(true) }}
                  className={`min-h-[96px] p-1.5 border-b border-r border-rose-50 cursor-pointer transition-colors ${
                    !isCurrentMonth ? 'opacity-35' : 'hover:bg-rose-50/40'
                  }`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1 transition-all ${
                    todayDay
                      ? 'bg-gradient-to-br from-rose-400 to-violet-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-rose-100'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const cat = ev.color ? EVENT_CATEGORIES.find(c => c.color === ev.color) : null
                      const bg = ev.color || '#E5E7EB'
                      const fg = cat?.textColor || '#374151'
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev) }}
                          className="text-[10px] truncate rounded-full px-1.5 py-0.5 font-semibold cursor-pointer hover:opacity-80 transition"
                          style={{ backgroundColor: bg, color: fg }}
                        >
                          {cat?.emoji} {ev.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-rose-400 px-1 font-medium">+{dayEvents.length - 3} עוד</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-white/90 rounded-3xl shadow-md border border-violet-100 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-100 to-rose-100 px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🌺</span>
            <h3 className="text-sm font-bold text-violet-700">בקרוב</h3>
          </div>
          <div className="p-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">אין אירועים קרובים</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((ev) => {
                  const cat = ev.color ? EVENT_CATEGORIES.find(c => c.color === ev.color) : null
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="flex items-start gap-2 cursor-pointer hover:bg-rose-50 rounded-2xl p-2 transition"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ring-1"
                        style={{ backgroundColor: ev.color || '#E5E7EB', outlineColor: ev.color || '#D1D5DB' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <p className="text-xs text-gray-400">
                            {format(parseISO(ev.startDate), ev.allDay ? 'd/M' : 'd/M, HH:mm')}
                          </p>
                          {cat && (
                            <span
                              className="text-[10px] px-1.5 py-0 rounded-full font-semibold"
                              style={{ backgroundColor: cat.color, color: cat.textColor }}
                            >
                              {cat.emoji} {cat.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add event modal ── */}
      {showModal && (
        <AddEventModal
          defaultDate={selectedDate}
          onClose={() => setShowModal(false)}
          onCreated={fetchEvents}
        />
      )}

      {/* ── Edit event modal ── */}
      {editingEvent && (
        <AddEventModal
          editEvent={editingEvent}
          onClose={() => setEditingEvent(null)}
          onCreated={fetchEvents}
        />
      )}

      {/* ── Event detail popup ── */}
      {selectedEvent && (() => {
        const cat = selectedEvent.color
          ? EVENT_CATEGORIES.find(c => c.color === selectedEvent.color)
          : detectEventCategory(selectedEvent.title)
        return (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Colored header */}
              <div className="px-6 py-4" style={{ backgroundColor: cat?.color || '#E5E7EB' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold mb-1 opacity-80" style={{ color: cat?.textColor || '#374151' }}>
                      {cat?.emoji} {cat?.label || 'כללי'}
                    </p>
                    <h2 className="text-lg font-extrabold leading-snug" style={{ color: cat?.textColor || '#374151' }} dir="auto">
                      {selectedEvent.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-xl leading-none opacity-50 hover:opacity-100 transition"
                    style={{ color: cat?.textColor || '#374151' }}
                  >×</button>
                </div>
              </div>

              <div className="p-6">
                {selectedEvent.description && (
                  <p className="text-sm text-gray-600 mb-4" dir="auto">{selectedEvent.description}</p>
                )}
                <div className="space-y-2 text-sm text-gray-500 mb-5">
                  <div className="flex gap-2 items-center">
                    <span className="w-4 text-rose-400">📅</span>
                    <span className="text-gray-400 text-xs w-10">התחלה</span>
                    <span className="font-medium text-gray-700">{format(parseISO(selectedEvent.startDate), selectedEvent.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="w-4 text-violet-400">🏁</span>
                    <span className="text-gray-400 text-xs w-10">סיום</span>
                    <span className="font-medium text-gray-700">{format(parseISO(selectedEvent.endDate), selectedEvent.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  {selectedEvent.recurring && (
                    <div className="flex gap-2 items-center">
                      <span className="w-4 text-amber-400">🔁</span>
                      <span className="text-gray-400 text-xs w-10">חזרה</span>
                      <span className="font-medium text-gray-700">{{ daily: 'כל יום', weekly: 'כל שבוע', monthly: 'כל חודש' }[selectedEvent.recurring] || selectedEvent.recurring}</span>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <span className="w-4 text-blue-400">👤</span>
                    <span className="text-gray-400 text-xs w-10">נוצר</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: selectedEvent.creator.color }} />
                      <span className="font-medium text-gray-700">{selectedEvent.creator.name}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingEvent(selectedEvent); setSelectedEvent(null) }}
                    className="flex-1 border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-2xl py-2 text-sm font-semibold transition"
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    onClick={() => deleteEvent(selectedEvent.id)}
                    className="flex-1 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl py-2 text-sm font-semibold transition"
                  >
                    🗑 מחק
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
