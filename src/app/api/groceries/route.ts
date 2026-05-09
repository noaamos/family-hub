import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { categorize } from '@/lib/categorize'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.groceryItem.findMany({
    include: { creator: { select: { id: true, name: true, color: true } } },
    orderBy: [{ checked: 'asc' }, { category: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, quantity } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const category = categorize(name)
  const item = await db.groceryItem.create({
    data: { name: name.trim(), quantity: quantity?.trim() || null, category, creatorId: session.id },
    include: { creator: { select: { id: true, name: true, color: true } } },
  })
  return NextResponse.json(item, { status: 201 })
}
