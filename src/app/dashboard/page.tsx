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
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev) }}
                        className="text-[10px] truncate rounded px-1 py-0.5 text-white font-medium cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: ev.color || ev.creator.color }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 3} more</div>
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
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming</h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming events</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 transition"
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ev.color || ev.creator.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-400">
                      {format(parseISO(ev.startDate), ev.allDay ? 'MMM d' : 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
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

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent.color || selectedEvent.creator.color }} />
                <h2 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            {selectedEvent.description && (
              <p className="text-sm text-gray-600 mb-3">{selectedEvent.description}</p>
            )}
            <div className="space-y-1 text-sm text-gray-500 mb-4">
              <p>Start: {format(parseISO(selectedEvent.startDate), selectedEvent.allDay ? 'MMM d, yyyy' : 'MMM d, yyyy h:mm a')}</p>
              <p>End: {format(parseISO(selectedEvent.endDate), selectedEvent.allDay ? 'MMM d, yyyy' : 'MMM d, yyyy h:mm a')}</p>
              {selectedEvent.recurring && <p>Repeats: {selectedEvent.recurring}</p>}
              <p>Created by: {selectedEvent.creator.name}</p>
            </div>
            <button
              onClick={() => deleteEvent(selectedEvent.id)}
              className="w-full border border-red-200 text-red-600 hover:bg-red-50 rounded-lg py-2 text-sm font-medium transition"
            >
              Delete event
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
