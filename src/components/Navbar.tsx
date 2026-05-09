'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type Props = { userName: string; userColor: string }

const NAV_LINKS = [
  { href: '/dashboard',           emoji: '🗓', text: 'יומן' },
  { href: '/dashboard/chores',    emoji: '✅', text: 'מטלות' },
  { href: '/dashboard/groceries', emoji: '🛒', text: 'קניות' },
  { href: '/dashboard/members',   emoji: '👥', text: 'חברים' },
]

export default function Navbar({ userName, userColor }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-4 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">

        <Link href="/dashboard" className="flex items-center gap-1 select-none">
          <span style={{ fontFamily: 'var(--font-bebas)' }} className="text-3xl tracking-widest text-gray-900 leading-none">
            FAMILY
          </span>
          <span style={{ fontFamily: 'var(--font-dancing)' }} className="text-2xl text-rose-400 leading-none mt-1">
            Planner
          </span>
        </Link>

        <div className="flex gap-0.5">
          {NAV_LINKS.map(({ href, emoji, text }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                <span className="text-base">{emoji}</span>
                <span className="hidden sm:inline">{text}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: userColor }}>
              {userName[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-600 hidden sm:block">{userName}</span>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-700 transition">יציאה</button>
        </div>

      </div>
    </nav>
  )
}
