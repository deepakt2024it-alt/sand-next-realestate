'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mobile, setMobile] = useState('')
  const [role, setRole] = useState('BUYER')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, mobile }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Create profile
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        mobile,
        role,
      })
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-lg border p-12 max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Successful!</h2>
          <p className="text-slate-500 mb-6">Check your email to confirm your account.</p>
          <Link href="/auth/login" className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏡</div>
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 mt-1">Join San D Real Estate Marketplace</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-2xl shadow-lg border p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
              placeholder="Your full name" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile</label>
            <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
              placeholder="9876543210" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'BUYER', label: '🛒 Buyer', desc: 'Looking to buy' },
                { value: 'SELLER', label: '🏷️ Seller', desc: 'Want to sell' },
              ].map(r => (
                <button key={r.value} type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-3 rounded-xl border text-left transition ${
                    role === r.value
                      ? 'border-teal-500 bg-teal-50 shadow-sm'
                      : 'border-slate-200 hover:border-teal-300'
                  }`}>
                  <div className="font-semibold text-sm">{r.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
              placeholder="Min 6 characters" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition shadow-sm">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link href="/auth/login" className="text-teal-600 font-semibold hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
