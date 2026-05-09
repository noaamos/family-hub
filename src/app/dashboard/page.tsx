'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths, addDays, subDays,
  startOfWeek, endOfWeek, isToday, parseISO, isWithinInterval,
} from 'date-fns'
import AddEventModal from '@/components/AddEventModal'
import { EVENT_CATEGORIES, detectEventCategory } from '@/lib/eventCategories'

type Creator = { id: string; name: string; color: string }
type Event = {
  id: string; title: string; description?: string
  startDate: string; endDate: string; allDay: boolean
  recurring?: string; color?: string; creator: Creator
}

// ── Planner colour palette — one per weekday (Sun→Sat) ──────────────────
const COL = [
  { bg: '#FFE4E8', header: '#FFB3C1', text: '#9F1239', label: 'א׳' },
  { bg: '#FEF3C7', header: '#FDE68A', text: '#92400E', label: 'ב׳' },
  { bg: '#ECFDF5', header: '#A7F3D0', text: '#065F46', label: 'ג׳' },
  { bg: '#EFF6FF', header: '#BFDBFE', text: '#1E40AF', label: 'ד׳' },
  { bg: '#F5F3FF', header: '#DDD6FE', text: '#5B21B6', label: 'ה׳' },
  { bg: '#FFF7ED', header: '#FED7AA', text: '#9A3412', label: 'ו׳' },
  { bg: '#FDF4FF', header: '#F0ABFC', text: '#86198F', label: 'ש׳' },
]

const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
const HE_DAYS   = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [dayView, setDayView] = useState<Date | null>(new Date())
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
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
  })

  function eventsForDay(day: Date) {
    return events.filter(e => {
      const s = parseISO(e.startDate), en = parseISO(e.endDate)
      return isWithinInterval(day, { start: s, end: en }) || isSameDay(day, s)
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

  const upcomingEvents = events.filter(e => parseISO(e.startDate) >= new Date()).slice(0, 5)

  // ── Shared event detail popup ──────────────────────────────────────────
  const eventDetail = selectedEvent && (() => {
    const cat = selectedEvent.color
      ? EVENT_CATEGORIES.find(c => c.color === selectedEvent.color)
      : detectEventCategory(selectedEvent.title)
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedEvent(null)}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm border border-gray-100"
          onClick={e => e.stopPropagation()}>
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ backgroundColor: cat?.color || '#F3F4F6' }}>
            <div>
              <p className="text-xs font-bold opacity-70 mb-0.5" style={{ color: cat?.textColor || '#374151' }}>
                {cat?.emoji} {cat?.label}
              </p>
              <h2 className="text-2xl font-bold" style={{ color: cat?.textColor || '#111827', fontFamily: 'var(--font-amatic)' }} dir="auto">
                {selectedEvent.title}
              </h2>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="text-2xl opacity-40 hover:opacity-80 transition leading-none"
              style={{ color: cat?.textColor }}>×</button>
          </div>
          <div className="p-5">
            {selectedEvent.description && (
              <p className="text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100" dir="auto">{selectedEvent.description}</p>
            )}
            <div className="space-y-2.5 mb-5">
              {[
                { icon: '📅', label: 'התחלה', val: format(parseISO(selectedEvent.startDate), selectedEvent.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm') },
                { icon: '🏁', label: 'סיום',  val: format(parseISO(selectedEvent.endDate),   selectedEvent.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm') },
                ...(selectedEvent.recurring ? [{ icon: '🔁', label: 'חזרה', val: ({ daily:'כל יום', weekly:'כל שבוע', monthly:'כל חודש' } as Record<string,string>)[selectedEvent.recurring] || selectedEvent.recurring }] : []),
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2 text-sm">
                  <span>{r.icon}</span>
                  <span className="text-gray-400 w-12 text-xs">{r.label}</span>
                  <span className="text-gray-700 font-medium">{r.val}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm">
                <span>👤</span>
                <span className="text-gray-400 w-12 text-xs">נוצר</span>
                <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: selectedEvent.creator.color }} />
                <span className="text-gray-700 font-medium">{selectedEvent.creator.name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingEvent(selectedEvent); setSelectedEvent(null) }}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                ✏️ ערוך
              </button>
              <button onClick={() => deleteEvent(selectedEvent.id)}
                className="flex-1 py-2 rounded-xl border border-red-100 text-sm font-semibold text-red-400 hover:bg-red-50 transition">
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
    const col = COL[dayView.getDay()]
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ backgroundColor: col.header }}>
            <button onClick={() => setDayView(null)}
              className="text-xs font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/50 hover:bg-white/80 transition" style={{ color: col.text }}>
              🗓 חודשי
            </button>
            <div className="text-center flex-1">
              <p className="text-xs font-semibold opacity-60" style={{ color: col.text }}>יום {HE_DAYS[dayView.getDay()]}</p>
              <p className="font-extrabold text-lg leading-tight" style={{ color: col.text, fontFamily: 'var(--font-heebo)' }}>
                {dayView.getDate()} ב{HE_MONTHS[dayView.getMonth()]} {dayView.getFullYear()}
              </p>
              {isToday(dayView) && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60" style={{ color: col.text }}>היום</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setDayView(subDays(dayView, 1))}
                className="w-7 h-7 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center font-bold transition" style={{ color: col.text }}>‹</button>
              <button onClick={() => setDayView(addDays(dayView, 1))}
                className="w-7 h-7 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center font-bold transition" style={{ color: col.text }}>›</button>
              <button onClick={() => { setSelectedDate(dayView); setShowModal(true) }}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition">
                + הוסף
              </button>
            </div>
          </div>

          {/* Events */}
          <div className="p-5 min-h-64">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="text-4xl mb-3">✨</span>
                <p className="text-gray-400 font-medium text-sm">אין אירועים ביום זה</p>
                <button onClick={() => { setSelectedDate(dayView); setShowModal(true) }}
                  className="mt-3 text-sm font-semibold underline underline-offset-2 text-gray-500 hover:text-gray-800 transition">
                  הוסף אירוע
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dayEvents.map(ev => {
                  const cat = ev.color ? EVENT_CATEGORIES.find(c => c.color === ev.color) : detectEventCategory(ev.title)
                  return (
                    <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                      className="flex gap-3 p-3 rounded-xl cursor-pointer hover:shadow-sm transition border"
                      style={{ borderColor: (ev.color || '#E5E7EB') + '99', backgroundColor: (ev.color || '#F9FAFB') + '33' }}>
                      <div className="text-xl flex-shrink-0">{cat?.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-lg leading-tight" dir="auto" style={{ fontFamily: 'var(--font-amatic)' }}>{ev.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ev.allDay ? 'כל היום' : `${format(parseISO(ev.startDate),'HH:mm')} – ${format(parseISO(ev.endDate),'HH:mm')}`}
                        </p>
                        {ev.description && <p className="text-xs text-gray-400 truncate mt-0.5" dir="auto">{ev.description}</p>}
                      </div>
                      <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
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

        {showModal && <AddEventModal defaultDate={selectedDate} onClose={() => setShowModal(false)} onCreated={fetchEvents} />}
        {editingEvent && <AddEventModal editEvent={editingEvent} onClose={() => setEditingEvent(null)} onCreated={fetchEvents} />}
        {eventDetail}
      </div>
    )
  }

  // ── Month view ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* ── Planner title ── */}
          <div className="px-4 sm:px-6 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div className="flex items-end gap-2 leading-none">
                <span style={{ fontFamily: 'var(--font-bebas)' }}
                  className="text-4xl sm:text-5xl tracking-widest text-gray-900 leading-none">
                  FAMILY
                </span>
                <span style={{ fontFamily: 'var(--font-dancing)' }}
                  className="text-3xl sm:text-4xl text-rose-400 leading-none pb-1">
                  Planner
                </span>
              </div>
              <button
                onClick={() => { setSelectedDate(undefined); setShowModal(true) }}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold px-4 py-2 rounded-full transition shadow-sm">
                + אירוע
              </button>
            </div>

            {/* Month strip */}
            <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {HE_MONTHS.map((m, i) => {
                const active = i === currentDate.getMonth()
                return (
                  <button key={m}
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), i, 1))}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                      active ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    }`}>
                    {m.slice(0, 3)}
                  </button>
                )
              })}
              <div className="flex-shrink-0 flex items-center gap-1 mr-2">
                <button onClick={() => setCurrentDate(c => subMonths(c, 1))}
                  className="w-6 h-6 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">‹</button>
                <button onClick={() => setCurrentDate(c => addMonths(c, 1))}
                  className="w-6 h-6 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">›</button>
              </div>
            </div>
          </div>

          {/* ── Day-of-week headers ── */}
          <div className="grid grid-cols-7">
            {COL.map(c => (
              <div key={c.label}
                className="py-2 sm:py-3 text-center text-xs sm:text-sm font-extrabold tracking-wide border-b border-gray-100"
                style={{ backgroundColor: c.header, color: c.text }}>
                {c.label}
              </div>
            ))}
          </div>

          {/* ── Days grid ── */}
          <div className="grid grid-cols-7 divide-x divide-gray-100">
            {days.map(day => {
              const col = COL[day.getDay()]
              const dayEvents = eventsForDay(day)
              const inMonth = isSameMonth(day, currentDate)
              const todayDay = isToday(day)
              return (
                <div key={day.toISOString()}
                  onClick={() => setDayView(day)}
                  className={`min-h-[72px] sm:min-h-[100px] p-1 sm:p-1.5 border-b border-gray-100 cursor-pointer transition-colors relative ${
                    !inMonth ? 'opacity-25' : ''
                  }`}
                  style={{ backgroundColor: inMonth ? col.bg + '55' : undefined }}>

                  {/* Day number */}
                  <div className={`w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-extrabold mb-0.5 ${
                    todayDay ? 'text-white' : ''
                  }`}
                    style={todayDay ? { backgroundColor: col.text, fontFamily: 'var(--font-heebo)' } : { color: col.text, fontFamily: 'var(--font-heebo)' }}>
                    {format(day, 'd')}
                  </div>

                  {/* Event chips — shown on all screen sizes */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => {
                      const cat = ev.color ? EVENT_CATEGORIES.find(c => c.color === ev.color) : null
                      return (
                        <div key={ev.id}
                          onClick={e => { e.stopPropagation(); setSelectedEvent(ev) }}
                          className="text-[9px] sm:text-xs leading-snug px-1 sm:px-1.5 py-0.5 rounded font-bold truncate cursor-pointer hover:opacity-80 transition"
                          style={{ backgroundColor: ev.color || col.header, color: cat?.textColor || col.text, fontFamily: 'var(--font-amatic)' }}>
                          {cat?.emoji} {ev.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <p className="text-[8px] sm:text-[9px] font-bold pl-0.5" style={{ color: col.text }}>+{dayEvents.length - 2}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="hidden lg:block w-64 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p style={{ fontFamily: 'var(--font-dancing)' }} className="text-xl text-gray-700">בקרוב ✨</p>
          </div>
          <div className="p-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">אין אירועים קרובים</p>
            ) : (
              <div className="space-y-1">
                {upcomingEvents.map(ev => {
                  const cat = ev.color ? EVENT_CATEGORIES.find(c => c.color === ev.color) : null
                  return (
                    <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                      className="flex items-start gap-2.5 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: ev.color || '#9CA3AF' }} />
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-800 truncate" dir="auto" style={{ fontFamily: 'var(--font-amatic)' }}>{ev.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cat?.emoji} {format(parseISO(ev.startDate), ev.allDay ? 'd/M' : 'd/M, HH:mm')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quote card */}
        <div className="rounded-2xl p-4 border border-yellow-100" style={{ backgroundColor: '#FFFDE7' }}>
          <p style={{ fontFamily: 'var(--font-dancing)' }} className="text-base text-yellow-700 leading-relaxed text-center">
            &ldquo;You&apos;re doing better than you think. Keep showing up.&rdquo;
          </p>
          <p className="text-yellow-400 text-center mt-2 text-lg">💛</p>
        </div>
      </div>

      {showModal && <AddEventModal defaultDate={selectedDate} onClose={() => setShowModal(false)} onCreated={fetchEvents} />}
      {editingEvent && <AddEventModal editEvent={editingEvent} onClose={() => setEditingEvent(null)} onCreated={fetchEvents} />}
      {eventDetail}
    </div>
  )
}
