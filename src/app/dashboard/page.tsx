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
  addDays,
  subDays,
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

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const HE_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

function heDate(d: Date) {
  return `${HE_DAYS[d.getDay()]}, ${d.getDate()} ב${HE_MONTHS[d.getMonth()]}`
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [dayView, setDayView] = useState<Date | null>(null)
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
    }).sort((a, b) => {
      if (a.allDay && !b.allDay) return -1
      if (!a.allDay && b.allDay) return 1
      return parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
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

  // ── Event detail popup (shared between views) ──────────────────────────
  const eventDetailPopup = selectedEvent && (() => {
    const cat = selectedEvent.color
      ? EVENT_CATEGORIES.find(c => c.color === selectedEvent.color)
      : detectEventCategory(selectedEvent.title)
    return (
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedEvent(null)}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm" onClick={e => e.stopPropagation()}>
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
              <button onClick={() => setSelectedEvent(null)} className="text-xl leading-none opacity-50 hover:opacity-100 transition" style={{ color: cat?.textColor || '#374151' }}>×</button>
            </div>
          </div>
          <div className="p-6">
            {selectedEvent.description && (
              <p className="text-sm text-gray-600 mb-4" dir="auto">{selectedEvent.description}</p>
            )}
            <div className="space-y-2 text-sm mb-5">
              <div className="flex gap-2 items-center">
                <span className="text-rose-400">📅</span>
                <span className="text-gray-400 text-xs w-10">התחלה</span>
                <span className="font-medium text-gray-700">{format(parseISO(selectedEvent.startDate), selectedEvent.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-violet-400">🏁</span>
                <span className="text-gray-400 text-xs w-10">סיום</span>
                <span className="font-medium text-gray-700">{format(parseISO(selectedEvent.endDate), selectedEvent.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm')}</span>
              </div>
              {selectedEvent.recurring && (
                <div className="flex gap-2 items-center">
                  <span className="text-amber-400">🔁</span>
                  <span className="text-gray-400 text-xs w-10">חזרה</span>
                  <span className="font-medium text-gray-700">{{ daily: 'כל יום', weekly: 'כל שבוע', monthly: 'כל חודש' }[selectedEvent.recurring] || selectedEvent.recurring}</span>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <span className="text-blue-400">👤</span>
                <span className="text-gray-400 text-xs w-10">נוצר</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: selectedEvent.creator.color }} />
                  <span className="font-medium text-gray-700">{selectedEvent.creator.name}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingEvent(selectedEvent); setSelectedEvent(null) }}
                className="flex-1 border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-2xl py-2 text-sm font-semibold transition">
                ✏️ ערוך
              </button>
              <button onClick={() => deleteEvent(selectedEvent.id)}
                className="flex-1 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl py-2 text-sm font-semibold transition">
                🗑 מחק
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  })()

  // ── Day view ──────────────────────────────────────────────────────────
  if (dayView) {
    const dayEvents = eventsForDay(dayView)
    const todayDay = isToday(dayView)
    return (
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1">
          <div className="bg-white/90 rounded-3xl shadow-md border border-rose-100 overflow-hidden">

            {/* Day view header */}
            <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-violet-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
              <button
                onClick={() => setDayView(null)}
                className="flex items-center gap-1.5 text-rose-500 hover:text-rose-700 font-semibold text-sm transition"
              >
                ← חזרה
              </button>
              <div className="flex items-center gap-2 min-w-0">
                {todayDay && <span className="text-base">🌸</span>}
                <h2 className="font-extrabold bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent text-sm sm:text-base truncate">
                  {heDate(dayView)}
                </h2>
                {todayDay && <span className="text-xs bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-full">היום</span>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setDayView(subDays(dayView, 1))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-rose-100 text-rose-400 transition font-bold">‹</button>
                <button onClick={() => setDayView(addDays(dayView, 1))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-violet-100 text-violet-400 transition font-bold">›</button>
                <button
                  onClick={() => { setSelectedDate(dayView); setShowModal(true) }}
                  className="bg-gradient-to-r from-rose-400 to-violet-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full transition shadow-sm hover:from-rose-500 hover:to-violet-600"
                >
                  + הוסף
                </button>
              </div>
            </div>

            {/* Events list */}
            <div className="p-4 sm:p-6 min-h-[300px]">
              {dayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-5xl mb-3">🌷</span>
                  <p className="text-gray-400 font-medium">אין אירועים ביום זה</p>
                  <button
                    onClick={() => { setSelectedDate(dayView); setShowModal(true) }}
                    className="mt-4 text-sm text-rose-500 hover:text-rose-700 font-semibold transition underline underline-offset-2"
                  >
                    הוסף אירוע ראשון
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map((ev) => {
                    const cat = ev.color ? EVENT_CATEGORIES.find(c => c.color === ev.color) : detectEventCategory(ev.title)
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="flex items-start gap-3 p-3 rounded-2xl cursor-pointer hover:shadow-sm transition-all border"
                        style={{ backgroundColor: cat?.color + '33' || '#F9FAFB', borderColor: cat?.color + '66' || '#E5E7EB' }}
                      >
                        <div className="flex-shrink-0 text-xl mt-0.5">{cat?.emoji || '📅'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate" dir="auto">{ev.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: cat?.textColor || '#6B7280' }}>
                            {ev.allDay
                              ? 'כל היום'
                              : `${format(parseISO(ev.startDate), 'HH:mm')} – ${format(parseISO(ev.endDate), 'HH:mm')}`}
                          </p>
                          {ev.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate" dir="auto">{ev.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 self-start mt-0.5"
                          style={{ backgroundColor: cat?.color || '#E5E7EB', color: cat?.textColor || '#374151' }}>
                          {cat?.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — same as month view */}
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
                      <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                        className="flex items-start gap-2 cursor-pointer hover:bg-rose-50 rounded-2xl p-2 transition">
                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: ev.color || '#E5E7EB' }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {format(parseISO(ev.startDate), ev.allDay ? 'd/M' : 'd/M, HH:mm')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {showModal && <AddEventModal defaultDate={selectedDate} onClose={() => setShowModal(false)} onCreated={fetchEvents} />}
        {editingEvent && <AddEventModal editEvent={editingEvent} onClose={() => setEditingEvent(null)} onCreated={fetchEvents} />}
        {eventDetailPopup}
      </div>
    )
  }

  // ── Month view ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* Calendar */}
      <div className="flex-1">
        <div className="bg-white/90 rounded-3xl shadow-md border border-rose-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-violet-100 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <span className="text-lg sm:text-2xl">🌸</span>
              <h2 className="text-sm sm:text-xl font-extrabold bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent truncate">
                {HE_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-rose-100 text-rose-400 transition font-bold">‹</button>
              <button onClick={() => setCurrentDate(new Date())}
                className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-white/80 text-rose-500 hover:bg-rose-50 border border-rose-200 transition">
                היום
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-violet-100 text-violet-400 transition font-bold">›</button>
              <button
                onClick={() => { setSelectedDate(undefined); setShowModal(true) }}
                className="bg-gradient-to-r from-rose-400 to-violet-500 hover:from-rose-500 hover:to-violet-600 text-white text-xs sm:text-sm font-bold px-2.5 sm:px-4 py-1.5 rounded-full transition shadow-sm"
              >
                + אירוע
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-rose-50 via-pink-50 to-violet-50 border-b border-rose-100">
            {DAY_HEADERS.map((d) => (
              <div key={d.label} className={`py-2 text-center text-xs font-bold tracking-wide ${d.color}`}>{d.label}</div>
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
                  onClick={() => setDayView(day)}
                  className={`min-h-[52px] sm:min-h-[88px] p-1 sm:p-1.5 border-b border-r border-rose-50 cursor-pointer transition-colors ${
                    !isCurrentMonth ? 'opacity-30' : 'hover:bg-rose-50/40'
                  }`}
                >
                  {/* Day number */}
                  <div className={`w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold mb-0.5 transition-all ${
                    todayDay
                      ? 'bg-gradient-to-br from-rose-400 to-violet-500 text-white shadow-sm'
                      : 'text-gray-600'
                  }`}>
                    {format(day, 'd')}
                  </div>

                  {/* Mobile: colored dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 sm:hidden mt-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div key={ev.id} className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: ev.color || '#9CA3AF' }} />
                      ))}
                    </div>
                  )}

                  {/* Desktop: event chips */}
                  <div className="hidden sm:block space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => {
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
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-rose-400 px-1 font-medium">+{dayEvents.length - 2} עוד</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sidebar — hidden on mobile, visible lg+ */}
      <div className="hidden lg:block w-72 space-y-4">
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
                    <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                      className="flex items-start gap-2 cursor-pointer hover:bg-rose-50 rounded-2xl p-2 transition">
                      <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: ev.color || '#E5E7EB' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{ev.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <p className="text-xs text-gray-400">
                            {format(parseISO(ev.startDate), ev.allDay ? 'd/M' : 'd/M, HH:mm')}
                          </p>
                          {cat && (
                            <span className="text-[10px] px-1.5 rounded-full font-semibold"
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
      </div>

      {showModal && <AddEventModal defaultDate={selectedDate} onClose={() => setShowModal(false)} onCreated={fetchEvents} />}
      {editingEvent && <AddEventModal editEvent={editingEvent} onClose={() => setEditingEvent(null)} onCreated={fetchEvents} />}
      {eventDetailPopup}
    </div>
  )
}
