import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactSellerButton } from '@/components/ContactSellerButton'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch current user watching the property
  const { data: { user } } = await supabase.auth.getUser()
  let buyerProfile = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('full_name, mobile').eq('id', user.id).single()
    buyerProfile = profile
  }

  const { data: property, error } = await supabase
    .from('properties')
    .select('*, profiles!properties_seller_id_fkey(full_name, mobile, role, kyc_status)')
    .eq('id', parseInt(id))
    .single()

  if (error || !property) return notFound()

  // Increment view count
  await supabase
    .from('properties')
    .update({ view_count: (property.view_count || 0) + 1 })
    .eq('id', property.id)

  const seller = property.profiles as { full_name: string; mobile: string; role: string; kyc_status: string } | null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>›</span>
        <Link href={`/properties?type=${property.property_type}`} className="hover:text-teal-600">{property.property_type}</Link>
        <span>›</span>
        <span className="text-slate-700 truncate">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-emerald-50 h-72 md:h-96 flex items-center justify-center">
            {property.image_url ? (
              <img src={property.image_url} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-7xl opacity-30">🏡</div>
            )}
          </div>

          {/* Title */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {property.broker_verified && <span className="px-3 py-1 text-xs font-bold bg-teal-100 text-teal-800 rounded-full">✔ Broker Verified</span>}
              {property.dtcp_approved && <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">DTCP ✓</span>}
              {property.cmda_approved && <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-full">CMDA ✓</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{property.title}</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-1">
              📍 {property.address_line1 && `${property.address_line1}, `}{property.city}{property.district ? `, ${property.district}` : ''}{property.state ? `, ${property.state}` : ''}{property.pincode ? ` - ${property.pincode}` : ''}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border text-center">
              <div className="text-sm text-slate-500">Price</div>
              <div className="text-xl font-bold text-teal-700">{formatPrice(property.expected_price)}</div>
            </div>
            {property.total_area_sqft && (
              <div className="bg-white rounded-xl p-4 border text-center">
                <div className="text-sm text-slate-500">Area</div>
                <div className="text-xl font-bold text-slate-800">{Number(property.total_area_sqft).toLocaleString()} sqft</div>
              </div>
            )}
            <div className="bg-white rounded-xl p-4 border text-center">
              <div className="text-sm text-slate-500">Type</div>
              <div className="text-xl font-bold text-slate-800">{property.property_type}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border text-center">
              <div className="text-sm text-slate-500">Views</div>
              <div className="text-xl font-bold text-slate-800">👁 {property.view_count}</div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">Description</h2>
            <p className="text-slate-600 leading-relaxed">{property.description || 'No description provided.'}</p>
          </div>

          {/* Details Table */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Survey No.', property.survey_number],
                ['Plot No.', property.plot_number],
                ['Facing', property.facing],
                ['Road Width', property.road_width_feet ? `${property.road_width_feet} ft` : null],
                ['Price/sqft', property.price_per_sqft ? `₹${Number(property.price_per_sqft).toLocaleString()}` : null],
                ['Negotiable', property.is_negotiable ? 'Yes' : 'No'],
                ['DTCP', property.dtcp_approved ? '✅ Approved' : 'No'],
                ['CMDA', property.cmda_approved ? '✅ Approved' : 'No'],
                ['Road Access', property.has_road_access ? '✅ Yes' : 'No'],
                ['Electricity', property.has_electricity ? '✅ Yes' : 'No'],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-slate-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Contact Card */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border p-6 sticky top-20 space-y-4">
            {seller && (
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-lg font-bold text-teal-700">
                  {seller.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{seller.full_name}</div>
                  <div className="text-xs text-slate-500">{seller.role} {seller.kyc_status === 'VERIFIED' ? '· KYC ✓' : ''}</div>
                </div>
              </div>
            )}
            
            {user ? (
              <>
                {seller?.mobile && (
                  <>
                    <a href={`tel:+91${seller.mobile}`}
                      className="block w-full text-center py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition">
                      📞 Call Seller
                    </a>
                    <a href={`https://wa.me/91${seller.mobile}?text=Hi, I'm interested in: ${property.title}`}
                      target="_blank"
                      className="block w-full text-center py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition">
                      💬 WhatsApp
                    </a>
                    <div className="pt-2 border-t mt-4">
                      <p className="text-xs text-slate-500 mb-3 text-center">Want to verify this property? Request the seller's verified land documents directly.</p>
                      <ContactSellerButton 
                        propertyId={property.id} 
                        propertyTitle={property.title} 
                        buyerName={buyerProfile?.full_name || user.email || 'A Buyer'} 
                        buyerPhone={buyerProfile?.mobile || 'No Phone on Profile'} 
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-600 mb-4">You must be logged in to view seller contact details or request documents.</p>
                <Link href="/auth/login"
                  className="block w-full text-center py-3 text-teal-600 font-semibold border-2 border-teal-200 rounded-xl hover:bg-teal-50 transition">
                  Login to Contact
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
