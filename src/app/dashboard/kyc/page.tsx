"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SellerKYCPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    landSize: '',
    landType: 'PLOT',
    ownerDetails: '',
    locationLat: 0,
    locationLng: 0,
  })

  // File States (we store the actual File objects before uploading)
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [panFile, setPanFile] = useState<File | null>(null)
  const [landDocsFile, setLandDocsFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Auto-fill available data
        const { data: profile } = await supabase.from('profiles').select('full_name, mobile').eq('id', user.id).single()
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || '',
            phone: profile.mobile || '',
          }))
        }
      } else {
        router.push('/auth/login')
      }
    }
    loadUser()
  }, [])

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            locationLat: position.coords.latitude,
            locationLng: position.coords.longitude
          }))
        },
        () => setError('Unable to retrieve your location. Please allow location access.')
      )
    } else {
      setError('Geolocation is not supported by your browser.')
    }
  }

  const handleNext = () => {
    setError(null)
    if (step === 1 && (!formData.fullName || !formData.phone)) {
      return setError('Please fill all required fields in Step 1')
    }
    if (step === 2 && (!aadhaarFile || !panFile)) {
      return setError('Please upload both Aadhaar and PAN documents')
    }
    if (step === 3 && (!formData.landSize || !formData.ownerDetails || !landDocsFile)) {
      return setError('Please complete land details and upload documents')
    }
    if (step === 3 && formData.locationLat === 0) {
      return setError('Please capture your live GPS location')
    }
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setError(null)
    setStep(s => s - 1)
  }

  const uploadFile = async (file: File, pathPrefix: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}_${pathPrefix}_${Math.random()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('kyc_documents')
      .upload(fileName, file)

    if (error) throw error
    
    const { data: urlData } = supabase.storage.from('kyc_documents').getPublicUrl(data.path)
    return urlData.publicUrl
  }

  const handleSubmit = async () => {
    if (!selfieFile) return setError('Please upload a live selfie')
    
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Upload all documents
      const aadhaarUrl = await uploadFile(aadhaarFile!, 'aadhaar')
      const panUrl = await uploadFile(panFile!, 'pan')
      const landDocUrl = await uploadFile(landDocsFile!, 'land')
      const selfieUrl = await uploadFile(selfieFile, 'selfie')

      // 2. Save to database
      const { error: dbError } = await supabase.from('seller_kyc').insert({
        user_id: userId,
        full_name: formData.fullName,
        phone_number: formData.phone,
        aadhaar_url: aadhaarUrl,
        pan_url: panUrl,
        land_documents_url: [landDocUrl],
        location_lat: formData.locationLat,
        location_lng: formData.locationLng,
        land_size: formData.landSize,
        land_type: formData.landType,
        owner_details: formData.ownerDetails,
        selfie_url: selfieUrl,
        status: 'PENDING'
      })

      if (dbError) throw dbError

      // 3. Trigger WhatsApp Automation
      try {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trigger: 'KYC_SUBMITTED',
            payload: {
              name: formData.fullName,
              phone: formData.phone,
              landSize: formData.landSize,
              landType: formData.landType,
              aadhaarUrl,
              panUrl,
              landDocUrl,
              selfieUrl
            }
          })
        })
      } catch (waError) {
        console.error("WhatsApp API Error:", waError)
        // We don't fail the KYC if WhatsApp notification fails
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred during verification submission.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-teal-700 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <h1 className="text-3xl font-extrabold relative z-10">Seller Verification (KYC)</h1>
          <p className="text-teal-100 mt-2 relative z-10">Secure listing process. Step {step} of 4</p>
          
          {/* Progress Bar */}
          <div className="mt-6 bg-teal-950/50 rounded-full h-2 overflow-hidden relative z-10">
            <div 
              className="bg-teal-300 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="p-8">
          
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800">1. Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name as per ID</label>
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp Active)</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="+91 9876543210" />
                  <p className="text-xs text-slate-500 mt-1">This number will be verified and used for buyer communications.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Govt ID Docs */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800">2. Identity Verification</h2>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition">
                  <span className="text-3xl mb-3 block">🪪</span>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Upload Aadhaar Card</label>
                  <p className="text-xs text-slate-500 mb-4">Front and Back (PDF or JPG/PNG)</p>
                  <input type="file" onChange={e => setAadhaarFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 mx-auto max-w-[250px]" />
                </div>
                
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition">
                  <span className="text-3xl mb-3 block">💳</span>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Upload PAN Card</label>
                  <p className="text-xs text-slate-500 mb-4">Clear photo of original PAN</p>
                  <input type="file" onChange={e => setPanFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 mx-auto max-w-[250px]" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Land Details & Location */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800">3. Primary Property/Land Details</h2>
              <p className="text-sm text-slate-500">Please provide details of at least one property to prove ownership intent.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Land Size (e.g. 1200 Sqft)</label>
                  <input type="text" value={formData.landSize} onChange={e => setFormData({...formData, landSize: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                  <select value={formData.landType} onChange={e => setFormData({...formData, landType: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option value="PLOT">Plot</option>
                    <option value="LAND">Agricultural Land</option>
                    <option value="HOUSE">House / Villa</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Details</label>
                <input type="text" value={formData.ownerDetails} onChange={e => setFormData({...formData, ownerDetails: e.target.value})} placeholder="Owner Name roughly matching ID"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">GPS Location Capture</label>
                <div className="flex items-center gap-4">
                  <button onClick={getLocation} type="button" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700">
                    📍 Capture Current Location
                  </button>
                  {formData.locationLat !== 0 && (
                    <span className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      ✓ Location Secured
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">You must be at the property location or grant GPS access to verify coordinates.</p>
              </div>

              <div className="border border-slate-300 rounded-2xl p-5">
                <label className="block text-sm font-bold text-slate-700 mb-1">Property Ownership Document</label>
                 <p className="text-xs text-slate-500 mb-3">Patta / Chitta / Sale Deed</p>
                <input type="file" onChange={e => setLandDocsFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500" />
              </div>
            </div>
          )}

          {/* STEP 4: Live Selfie */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h2 className="text-xl font-bold text-slate-800">4. Live Photo Verification</h2>
              <p className="text-slate-600 max-w-sm mx-auto">To ensure authenticity, please upload a clear, live selfie. This will be matched securely against your ID documents.</p>
              
              <div className="w-48 h-48 mx-auto bg-slate-100 border-4 border-dashed border-teal-200 rounded-full flex flex-col items-center justify-center overflow-hidden relative group">
                {selfieFile ? (
                   <img src={URL.createObjectURL(selfieFile)} alt="Selfie preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-4xl mb-2">📸</span>
                    <span className="text-xs font-semibold text-slate-500">Upload Selfie</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="user" onChange={e => setSelfieFile(e.target.files?.[0] || null)} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex gap-4 pt-6 border-t border-slate-100">
            {step > 1 && (
              <button 
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                className="flex-[2] px-6 py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Uploading encrypted data...
                  </>
                ) : 'Submit Verification'}
              </button>
            )}
          </div>

        </div>
      </div>
      
      {/* WhatsApp Help CTA */}
      <div className="bg-green-50 rounded-2xl p-6 border border-green-200 flex items-center justify-between text-left">
        <div>
          <h3 className="text-lg font-bold text-green-900">Need help with documentation?</h3>
          <p className="text-sm text-green-700">Contact admin directly on WhatsApp for manual verification support.</p>
        </div>
        <a 
          href="https://wa.me/919361044698?text=Hi Admin, I need help with my Seller KYC documentation and registration process." 
          target="_blank" rel="noreferrer"
          className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
        >
          💬 WhatsApp Admin
        </a>
      </div>
    </div>
  )
}

