import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PropertyCard } from '@/components/PropertyCard'
import { PROPERTY_TYPES } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzRaTTM2IDI0djItNHYtMmg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-teal-500/30 text-teal-200 rounded-full text-sm font-medium mb-6 backdrop-blur">
              🏡 Tamil Nadu&apos;s #1 Real Estate Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Find Your <em className="text-amber-400 not-italic">Perfect</em><br/>
              Land & Property
            </h1>
            <p className="text-lg text-teal-100/80 mb-8 max-w-lg">
              Verified listings across Tamil Nadu. DTCP approved plots, agricultural lands, residential & commercial properties.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/properties"
                className="px-6 py-3 bg-white text-teal-800 font-semibold rounded-xl hover:bg-teal-50 transition shadow-lg">
                🔍 Browse Properties
              </Link>
              <Link href="/dashboard"
                className="px-6 py-3 bg-teal-500/30 text-white font-semibold rounded-xl hover:bg-teal-500/50 backdrop-blur transition border border-teal-400/30">
                + Sell Property
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { num: '2,400+', label: 'Active Listings' },
              { num: '850+', label: 'Verified Properties' },
              { num: '340+', label: 'Trusted Brokers' },
              { num: '12+', label: 'Districts' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-amber-400">{s.num}</div>
                <div className="text-sm text-teal-200 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {PROPERTY_TYPES.map(t => (
              <Link key={t.value} href={`/properties?type=${t.value}`}
                className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition min-w-[120px]">
                <span className="text-2xl">{t.icon}</span>
                <span className="text-sm font-semibold text-slate-700">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Featured Listings</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">Premium Properties</h2>
            <p className="text-slate-500 mt-2">Hand-picked, verified properties from trusted sellers</p>
          </div>
          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-4">🏗️</div>
              <p className="font-semibold">No properties listed yet</p>
              <p className="text-sm mt-1">Be the first to list a property!</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/properties"
              className="inline-block px-6 py-3 text-teal-700 font-semibold border-2 border-teal-200 rounded-xl hover:bg-teal-50 transition">
              View All Properties →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Process</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">How San D Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '1️⃣', title: 'Register & KYC', desc: 'Sign up with your email. Complete KYC for trust.' },
              { icon: '2️⃣', title: 'List Property', desc: 'Upload photos, legal documents, and pin the location.' },
              { icon: '3️⃣', title: 'Broker Verifies', desc: 'A certified broker reviews and approves the listing.' },
              { icon: '4️⃣', title: 'Connect & Deal', desc: 'Buyers contact sellers directly via WhatsApp.' },
            ].map(s => (
              <div key={s.title} className="text-center p-6">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">{s.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
