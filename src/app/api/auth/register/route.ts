import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
  const color = colors[Math.floor(Math.random() * colors.length)]

  const isFirst = (await db.user.count()) === 0
  const user = await db.user.create({
    data: { name, email, password: hashed, color, role: isFirst ? 'admin' : 'member' },
  })

  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role, color: user.color })
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, color: user.color })
}
