import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const events = await db.event.findMany({
    include: { creator: { select: { id: true, name: true, color: true } } },
    orderBy: { startDate: 'asc' },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, startDate, endDate, allDay, recurring, color } = await req.json()

  if (!title || !startDate || !endDate) {
    return NextResponse.json({ error: 'title, startDate and endDate required' }, { status: 400 })
  }

  const event = await db.event.create({
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      allDay: allDay ?? false,
      recurring,
      color: color || session.color,
      creatorId: session.id,
    },
    include: { creator: { select: { id: true, name: true, color: true } } },
  })
  return NextResponse.json(event, { status: 201 })
}
