import type { Metadata } from 'next'
import { Geist, Bebas_Neue, Dancing_Script, Heebo } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' })
const dancing = Dancing_Script({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-dancing' })
const heebo = Heebo({ subsets: ['latin', 'hebrew'], weight: ['400', '500', '700', '800'], variable: '--font-heebo' })

export const metadata: Metadata = {
  title: 'Family Hub',
  description: 'Your family calendar and chore tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" className={`${geist.variable} ${bebas.variable} ${dancing.variable} ${heebo.variable} h-full`}>
      <body className="h-full bg-white font-sans antialiased" style={{ fontFamily: 'var(--font-heebo), var(--font-geist), sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
