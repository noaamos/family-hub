import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const item = await db.groceryItem.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.groceryItem.update({
    where: { id },
    data: { checked: !item.checked, checkedAt: !item.checked ? new Date() : null },
    include: { creator: { select: { id: true, name: true, color: true } } },
  })
  return NextResponse.json(updated)
}
