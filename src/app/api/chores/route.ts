import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chores = await db.chore.findMany({
    include: {
      assignee: { select: { id: true, name: true, color: true } },
      creator: { select: { id: true, name: true, color: true } },
    },
    orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(chores)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, dueDate, recurring, assigneeId } = await req.json()

  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }

  const chore = await db.chore.create({
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      recurring,
      assigneeId: assigneeId || null,
      creatorId: session.id,
    },
    include: {
      assignee: { select: { id: true, name: true, color: true } },
      creator: { select: { id: true, name: true, color: true } },
    },
  })
  return NextResponse.json(chore, { status: 201 })
}
