import { createClient } from '@/lib/supabase/server'
import { PropertyCard } from '@/components/PropertyCard'
import { PROPERTY_TYPES, CITIES } from '@/lib/types'
import Link from 'next/link'

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; city?: string; minPrice?: string; maxPrice?: string; sort?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from('properties').select('*').eq('status', 'ACTIVE')

  if (params.type) query = query.eq('property_type', params.type)
  if (params.city) query = query.ilike('city', `%${params.city}%`)
  if (params.minPrice) query = query.gte('expected_price', parseInt(params.minPrice))
  if (params.maxPrice) query = query.lte('expected_price', parseInt(params.maxPrice))

  if (params.sort === 'price_asc') query = query.order('expected_price', { ascending: true })
  else if (params.sort === 'price_desc') query = query.order('expected_price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: properties, error } = await query.limit(50)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR FILTERS */}
        <aside className="lg:w-72 shrink-0">
          <form className="bg-white rounded-2xl shadow-sm border p-5 space-y-5 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Filters</h3>
              <Link href="/properties" className="text-sm text-teal-600 hover:underline">Clear all</Link>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">Property Type</label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map(t => (
                  <Link key={t.value}
                    href={`/properties?type=${t.value}${params.city ? `&city=${params.city}` : ''}`}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                      params.type === t.value
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                    }`}>
                    {t.icon} {t.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">City / District</label>
              <div className="flex flex-wrap gap-1.5">
                {CITIES.slice(0, 8).map(city => (
                  <Link key={city}
                    href={`/properties?city=${city}${params.type ? `&type=${params.type}` : ''}`}
                    className={`px-2.5 py-1 text-xs rounded-full border transition ${
                      params.city === city
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-teal-400'
                    }`}>
                    {city}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">Sort By</label>
              <div className="space-y-1">
                {[
                  { v: '', l: 'Newest First' },
                  { v: 'price_asc', l: 'Price: Low → High' },
                  { v: 'price_desc', l: 'Price: High → Low' },
                ].map(s => (
                  <Link key={s.v}
                    href={`/properties?${params.type ? `type=${params.type}&` : ''}${params.city ? `city=${params.city}&` : ''}sort=${s.v}`}
                    className={`block px-3 py-2 text-sm rounded-lg transition ${
                      (params.sort || '') === s.v
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}>
                    {s.l}
                  </Link>
                ))}
              </div>
            </div>
          </form>
        </aside>

        {/* RESULTS */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <strong className="text-lg text-slate-800">{properties?.length ?? 0}</strong>
              <span className="text-slate-500 ml-1">properties found</span>
              {params.city && <span className="text-slate-500"> in <strong className="text-teal-700">{params.city}</strong></span>}
              {params.type && <span className="text-slate-500"> · <strong className="text-teal-700">{params.type}</strong></span>}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-4">Error loading properties: {error.message}</div>
          )}

          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-slate-600">No properties found</h3>
              <p className="text-sm mt-1">Try adjusting your filters or <Link href="/properties" className="text-teal-600 hover:underline">browse all</Link>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
