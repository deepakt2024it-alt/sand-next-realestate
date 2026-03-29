import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KYCTable } from './kyc-table'

export default async function AdminKYCPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard') // Unauthorized
  }

  // Fetch KYC records
  const { data: kycRecords, error } = await supabase
    .from('seller_kyc')
    .select('*, profiles!seller_kyc_user_id_fkey(email)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching KYC:', error)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Control Panel</h1>
          <p className="text-slate-500 mt-1">Review and manage Seller KYC Verification Requests</p>
        </div>
        <div className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          Admin Area
        </div>
      </div>

      <KYCTable initialRecords={kycRecords || []} />
    </div>
  )
}
