import Link from 'next/link'
import { formatPrice } from '@/lib/types'
import type { Property } from '@/lib/types'

export function PropertyCard({ property }: { property: Property }) {
  const p = property
  return (
    <Link href={`/properties/${p.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 bg-gradient-to-br from-teal-100 to-emerald-50 overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl opacity-40">🏡</div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {p.is_featured && (
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-amber-900 rounded-full">⭐ Featured</span>
          )}
          {p.broker_verified && (
            <span className="px-2 py-0.5 text-xs font-bold bg-teal-500 text-white rounded-full">✔ Verified</span>
          )}
          {p.dtcp_approved && (
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">DTCP</span>
          )}
        </div>
        <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold bg-white/90 text-slate-700 rounded-full backdrop-blur">
          {p.property_type}
        </span>
      </div>
      <div className="p-4">
        <div className="text-lg font-bold text-teal-700 mb-1">{formatPrice(p.expected_price)}</div>
        <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-teal-700 transition">{p.title}</h3>
        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
          📍 {p.city}{p.district ? `, ${p.district}` : ''}{p.state ? `, ${p.state}` : ''}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          {p.total_area_sqft && <span>📐 {Number(p.total_area_sqft).toLocaleString()} sqft</span>}
          {p.facing && <span>🧭 {p.facing}</span>}
          <span className="ml-auto">👁 {p.view_count}</span>
        </div>
      </div>
    </Link>
  )
}
