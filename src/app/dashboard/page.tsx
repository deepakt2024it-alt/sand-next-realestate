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

  let kycRecord = null
  if (profile?.role === 'SELLER') {
    const { data } = await supabase
      .from('seller_kyc')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    kycRecord = data
  }

  const kycStatus = kycRecord?.status || 'NOT_SUBMITTED'

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

      {/* KYC Warning Banner for Sellers */}
      {profile?.role === 'SELLER' && kycStatus !== 'VERIFIED' && (
        <div className={`mb-8 p-6 rounded-2xl border ${kycStatus === 'NOT_SUBMITTED' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-bold ${kycStatus === 'NOT_SUBMITTED' ? 'text-amber-800' : 'text-blue-800'}`}>
                {kycStatus === 'NOT_SUBMITTED' ? '⚠️ Action Required: Complete your Seller KYC' : '⏳ KYC Verification Pending'}
              </h3>
              <p className={`mt-1 text-sm ${kycStatus === 'NOT_SUBMITTED' ? 'text-amber-700' : 'text-blue-700'}`}>
                {kycStatus === 'NOT_SUBMITTED' 
                  ? 'You must complete the mandatory KYC verification process before you can list properties on our platform. This helps maintain a trusted marketplace.'
                  : 'Your KYC documents have been submitted and are currently under review by our admin team. You will be notified once verified.'}
              </p>
            </div>
            {kycStatus === 'NOT_SUBMITTED' && (
              <Link href="/dashboard/kyc" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
                Start Verification
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border p-6 text-center">
          <div className="text-3xl font-bold text-teal-700">{myProperties?.length || 0}</div>
          <div className="text-sm text-slate-500 mt-1">My Listings</div>
        </div>
        <div className="bg-white rounded-2xl border p-6 text-center">
          <div className="text-3xl font-bold text-emerald-600">{myFavorites?.length || 0}</div>
          <div className="text-sm text-slate-500 mt-1">Saved Properties</div>
        </div>
        <div className="bg-white rounded-2xl border p-6 text-center">
          <div className={`text-2xl font-bold mt-1 ${
            kycStatus === 'VERIFIED' ? 'text-green-600' : 
            kycStatus === 'PENDING' ? 'text-blue-600' : 
            kycStatus === 'REJECTED' ? 'text-red-500' : 
            'text-slate-500'
          }`}>
            {profile?.role === 'SELLER' ? kycStatus.replace('_', ' ') : 'N/A (Buyer)'}
          </div>
          <div className="text-sm text-slate-500 mt-1">KYC Status</div>
        </div>
      </div>

      {/* My Properties */}
      <div className="bg-white rounded-2xl border p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">My Properties</h2>
          <div className="flex gap-4">
            {profile?.role === 'SELLER' && kycStatus === 'VERIFIED' && (
              <Link href="/properties/new" className="text-sm bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition">
                + Add Listing
              </Link>
            )}
            <Link href="/properties" className="text-sm text-teal-600 font-semibold py-2 px-4 hover:bg-teal-50 rounded-lg transition">Browse All →</Link>
          </div>
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
