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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

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
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
              >
                ›
              </button>
              <button
                onClick={() => { setSelectedDate(undefined); setShowModal(true) }}
                className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
              >
                + Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayEvents = eventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const todayDay = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => { setSelectedDate(day); setShowModal(true) }}
                  className={`min-h-[80px] p-1 border-b border-r border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  }`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${
                    todayDay ? 'bg-indigo-600 text-white' : 'text-gray-700'
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
                          className="text-[10px] truncate rounded px-1 py-0.5 font-medium cursor-pointer hover:opacity-80 transition"
                          style={{ backgroundColor: bg, color: fg }}
                        >
                          {ev.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 3} עוד</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">בקרוב</h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400">אין אירועים קרובים</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((ev) => {
                const cat = ev.color ? EVENT_CATEGORIES.find(c => c.color === ev.color) : null
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 transition"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 border"
                      style={{ backgroundColor: ev.color || '#E5E7EB', borderColor: ev.color || '#D1D5DB' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {format(parseISO(ev.startDate), ev.allDay ? 'd/M' : 'd/M, HH:mm')}
                        </p>
                        {cat && (
                          <span className="text-[10px] px-1.5 py-0 rounded-full font-medium"
                            style={{ backgroundColor: cat.color, color: cat.textColor }}>
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

      {showModal && (
        <AddEventModal
          defaultDate={selectedDate}
          onClose={() => setShowModal(false)}
          onCreated={fetchEvents}
        />
      )}

      {selectedEvent && (() => {
        const cat = selectedEvent.color
          ? EVENT_CATEGORIES.find(c => c.color === selectedEvent.color)
          : detectEventCategory(selectedEvent.title)
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              {/* Colored header strip */}
              <div className="px-6 py-4" style={{ backgroundColor: cat?.color || '#E5E7EB' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: cat?.textColor || '#374151' }}>
                      {cat?.emoji} {cat?.label || 'כללי'}
                    </p>
                    <h2 className="text-lg font-bold" style={{ color: cat?.textColor || '#374151' }} dir="auto">
                      {selectedEvent.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-xl leading-none opacity-60 hover:opacity-100 transition"
                    style={{ color: cat?.textColor || '#374151' }}
                  >×</button>
                </div>
              </div>

              <div className="p-6">
                {selectedEvent.description && (
                  <p className="text-sm text-gray-600 mb-4" dir="auto">{selectedEvent.description}</p>
                )}
                <div className="space-y-2 text-sm text-gray-500 mb-5">
                  <div className="flex gap-2">
                    <span className="w-14 text-gray-400 flex-shrink-0">התחלה</span>
                    <span>{format(parseISO(selectedEvent.startDate), selectedEvent.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-14 text-gray-400 flex-shrink-0">סיום</span>
                    <span>{format(parseISO(selectedEvent.endDate), selectedEvent.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  {selectedEvent.recurring && (
                    <div className="flex gap-2">
                      <span className="w-14 text-gray-400 flex-shrink-0">חזרה</span>
                      <span>{{ daily: 'כל יום', weekly: 'כל שבוע', monthly: 'כל חודש' }[selectedEvent.recurring] || selectedEvent.recurring}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="w-14 text-gray-400 flex-shrink-0">נוצר על ידי</span>
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: selectedEvent.creator.color }} />
                      {selectedEvent.creator.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteEvent(selectedEvent.id)}
                  className="w-full border border-red-200 text-red-500 hover:bg-red-50 rounded-lg py-2 text-sm font-medium transition"
                >
                  מחק אירוע
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
