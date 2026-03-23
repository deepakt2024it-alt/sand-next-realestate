import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const { data: myFavorites } = await supabase
    .from('favorites')
    .select('*, properties(*)')
    .eq('user_id', user.id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
            <p className="text-teal-100">{user.email} · <span className="capitalize">{profile?.role?.toLowerCase() || 'buyer'}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border p-6 text-center">
          <div className="text-3xl font-bold text-teal-700">{myProperties?.length || 0}</div>
          <div className="text-sm text-slate-500 mt-1">My Listings</div>
        </div>
        <div className="bg-white rounded-2xl border p-6 text-center">
          <div className="text-3xl font-bold text-amber-600">{myFavorites?.length || 0}</div>
          <div className="text-sm text-slate-500 mt-1">Saved Properties</div>
        </div>
        <div className="bg-white rounded-2xl border p-6 text-center">
          <div className="text-3xl font-bold text-slate-700">{profile?.kyc_status || 'PENDING'}</div>
          <div className="text-sm text-slate-500 mt-1">KYC Status</div>
        </div>
      </div>

      {/* My Properties */}
      <div className="bg-white rounded-2xl border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">My Properties</h2>
          <Link href="/properties" className="text-sm text-teal-600 font-semibold hover:underline">Browse All →</Link>
        </div>
        {myProperties && myProperties.length > 0 ? (
          <div className="space-y-3">
            {myProperties.map(p => (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="flex items-center justify-between p-4 rounded-xl border hover:border-teal-300 hover:bg-teal-50/50 transition">
                <div>
                  <div className="font-semibold text-slate-800">{p.title}</div>
                  <div className="text-sm text-slate-500">📍 {p.city} · {p.property_type}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-teal-700">{formatPrice(p.expected_price)}</div>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    p.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{p.status}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <div className="text-3xl mb-2">🏗️</div>
            <p>No properties listed yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
