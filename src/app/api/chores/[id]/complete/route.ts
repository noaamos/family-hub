import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const chore = await db.chore.findUnique({ where: { id } })
  if (!chore) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.chore.update({
    where: { id },
    data: {
      completed: !chore.completed,
      completedAt: !chore.completed ? new Date() : null,
    },
    include: {
      assignee: { select: { id: true, name: true, color: true } },
      creator: { select: { id: true, name: true, color: true } },
    },
  })
  return NextResponse.json(updated)
}
