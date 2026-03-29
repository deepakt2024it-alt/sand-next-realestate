'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-teal-700 transition">
          <span className="text-2xl">🏡</span>
          San <span className="text-teal-600">D</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {['PLOT', 'LAND', 'HOUSE', 'COMMERCIAL'].map(t => (
            <Link key={t} href={`/properties?type=${t}`}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition">
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </Link>
          ))}
          <div className="w-px h-5 bg-slate-300 mx-2"></div>
          <Link href="/buyer-request"
            className="px-3 py-2 text-sm font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">
            Post Requirement
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition">
                Dashboard
              </Link>
              <button onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 rounded-lg transition">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg transition">
                Login
              </Link>
              <Link href="/auth/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition shadow-sm">
                Register
              </Link>
            </>
          )}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {['PLOT', 'LAND', 'HOUSE', 'COMMERCIAL'].map(t => (
            <Link key={t} href={`/properties?type=${t}`}
              className="block px-3 py-2 text-sm text-slate-600 hover:bg-teal-50 rounded-lg"
              onClick={() => setMenuOpen(false)}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
