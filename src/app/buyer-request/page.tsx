"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BuyerRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    requirements: '',
    budget: '',
    location: ''
  })

  // Try to auto-load user info if logged in
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase.from('profiles').select('full_name, mobile').eq('id', user.id).single()
        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.full_name || '',
            phone: profile.mobile || ''
          }))
        }
      }
    }
    checkUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Save to Database
      const { error: dbError } = await supabase.from('buyer_requirements').insert({
        buyer_id: userId, // might remain null if guest
        name: formData.name,
        phone_number: formData.phone,
        land_requirements: formData.requirements,
        budget: formData.budget,
        preferred_location: formData.location
      })

      if (dbError) throw dbError

      // 2. Trigger WhatsApp Automation
      try {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trigger: 'BUYER_REQUEST',
            payload: formData
          })
        })
      } catch (waError) {
        console.error("WhatsApp API Error:", waError)
      }

      setSuccess(true)
      setIsSubmitting(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to submit requirement')
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-teal-50 border border-teal-200 rounded-3xl p-12">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-teal-800 mb-4">Request Submitted!</h1>
          <p className="text-teal-600 mb-8">
            Thank you, {formData.name}. We have logged your requirements for {formData.location}. Our team and verified sellers will be notified immediately via WhatsApp.
          </p>
          <button onClick={() => router.push('/properties')} className="bg-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-500/30">
            Browse Current Listings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h1 className="text-3xl font-extrabold relative z-10">Post a Requirement</h1>
          <p className="text-amber-100 mt-2 relative z-10">Looking for a specific property? Let our network know.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp Number</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="+91 9876543210" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Preferred Location</label>
            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. OMR, Chennai" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Budget Range</label>
            <select required value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
              <option value="">Select Budget Engine</option>
              <option value="Under 20L">Under ₹20 Lakhs</option>
              <option value="20L - 50L">₹20 Lakhs - ₹50 Lakhs</option>
              <option value="50L - 1Cr">₹50 Lakhs - ₹1 Crore</option>
              <option value="1Cr - 5Cr">₹1 Crore - ₹5 Crores</option>
              <option value="5Cr+">₹5 Crores+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Specific Requirements</label>
            <textarea required rows={4} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" 
              placeholder="Looking for a 1200 sqft corner plot near the main road..." />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Securing Requirement...' : 'Submit & Notify Sellers'}
          </button>
        </form>
      </div>
    </div>
  )
}
