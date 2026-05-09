'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type Props = { userName: string; userColor: string }

export default function Navbar({ userName, userColor }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: '/dashboard', label: 'Calendar' },
    { href: '/dashboard/chores', label: 'Chores' },
    { href: '/dashboard/members', label: 'Members' },
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-gray-900">
            <span className="text-xl">🏠</span>
            <span>Family Hub</span>
          </Link>
          <div className="flex gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  pathname === href
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: userColor }}
            >
              {userName[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 hidden sm:block">{userName}</span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
