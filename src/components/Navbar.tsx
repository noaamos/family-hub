'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type Props = { userName: string; userColor: string }

export default function Navbar({ userName, userColor }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: '/dashboard',            label: '🗓', text: 'יומן' },
    { href: '/dashboard/chores',     label: '✅', text: 'מטלות' },
    { href: '/dashboard/groceries',  label: '🛒', text: 'קניות' },
    { href: '/dashboard/members',    label: '👥', text: 'חברים' },
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">

        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="flex items-center gap-2 select-none">
            <span className="text-2xl">🌸</span>
            <span className="font-extrabold bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent text-lg tracking-tight">
              Family Hub
            </span>
          </Link>

          <div className="flex gap-1">
            {links.map(({ href, label, text }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-rose-100 to-violet-100 text-violet-700 shadow-sm'
                      : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  <span>{label}</span>
                  <span className="hidden sm:inline">{text}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-rose-200"
              style={{ backgroundColor: userColor }}
            >
              {userName[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-600 hidden sm:block font-medium">{userName}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-rose-500 transition px-2 py-1 rounded-full hover:bg-rose-50"
          >
            יציאה
          </button>
        </div>

      </div>
    </nav>
  )
}
