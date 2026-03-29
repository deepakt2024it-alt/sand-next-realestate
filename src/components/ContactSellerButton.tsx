'use client'

import { useState } from 'react'

export function ContactSellerButton({ propertyId, propertyTitle, buyerName, buyerPhone }: { propertyId: number, propertyTitle: string, buyerName: string, buyerPhone: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleInterest = async () => {
    setLoading(true)
    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'BUYER_INTEREST',
          payload: {
            propertyId,
            propertyTitle,
            buyerName,
            buyerPhone
          }
        })
      })
      setSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full text-center py-3 bg-green-50 text-green-700 font-semibold rounded-xl border border-green-200">
        ✅ Request Sent to Seller
      </div>
    )
  }

  return (
    <button 
      onClick={handleInterest}
      disabled={loading}
      className="w-full text-center py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
    >
      {loading ? 'Sending...' : 'Request Seller Documents'}
    </button>
  )
}
