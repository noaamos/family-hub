import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import ReminderBanner from '@/components/ReminderBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userName={session.name} userColor={session.color} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <ReminderBanner userId={session.id} />
        {children}
      </main>
    </div>
  )
}
