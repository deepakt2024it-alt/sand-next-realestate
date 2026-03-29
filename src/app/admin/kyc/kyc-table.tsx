'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function KYCTable({ initialRecords }: { initialRecords: any[] }) {
  const [records, setRecords] = useState(initialRecords)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const supabase = createClient()

  const handleUpdateStatus = async (id: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setLoadingId(id)
    try {
      const { error } = await supabase
        .from('seller_kyc')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord({ ...selectedRecord, status: newStatus })
      }
    } catch (err) {
      console.error(err)
      alert('Failed to update status.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleManualWhatsApp = async (record: any) => {
    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'MANUAL_ADMIN_PING',
          payload: { note: `Manual ping for KYC ID: ${record.id}`, sellerInfo: record }
        })
      })
      alert('Manual WhatsApp trigger fired (Check console).')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Modal for Details */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">KYC Details: {selectedRecord.full_name}</h2>
                <p className="text-slate-500">ID: {selectedRecord.id}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-800 text-2xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-bold text-slate-800 mb-2">Personal</h3>
                <p><strong>Phone:</strong> {selectedRecord.phone_number}</p>
                <p><strong>Owner Details:</strong> {selectedRecord.owner_details}</p>
                <p><strong>Location:</strong> {selectedRecord.location_lat}, {selectedRecord.location_lng} <a href={`https://maps.google.com/?q=${selectedRecord.location_lat},${selectedRecord.location_lng}`} target="_blank" className="text-teal-600 underline text-xs ml-2">Map</a></p>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">Property</h3>
                <p><strong>Type:</strong> {selectedRecord.land_type}</p>
                <p><strong>Size:</strong> {selectedRecord.land_size}</p>
                <p><strong>Status:</strong> <span className={`font-bold ${selectedRecord.status === 'VERIFIED' ? 'text-green-600' : selectedRecord.status === 'REJECTED' ? 'text-red-600' : 'text-amber-600'}`}>{selectedRecord.status}</span></p>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 mb-3">Documents</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <a href={selectedRecord.selfie_url} target="_blank" className="block p-2 border rounded hover:border-teal-500 transition text-center">
                <img src={selectedRecord.selfie_url} alt="Selfie" className="w-full h-32 object-cover rounded mb-2 bg-slate-100" />
                <span className="text-xs font-semibold">Selfie</span>
              </a>
              <a href={selectedRecord.aadhaar_url} target="_blank" className="block p-2 border rounded hover:border-teal-500 transition text-center flex flex-col items-center justify-center">
                <span className="text-4xl mb-2">🪪</span>
                <span className="text-xs font-semibold">Aadhaar (View)</span>
              </a>
              <a href={selectedRecord.pan_url} target="_blank" className="block p-2 border rounded hover:border-teal-500 transition text-center flex flex-col items-center justify-center">
                <span className="text-4xl mb-2">💳</span>
                <span className="text-xs font-semibold">PAN (View)</span>
              </a>
              <a href={selectedRecord.land_documents_url[0]} target="_blank" className="block p-2 border rounded hover:border-teal-500 transition text-center flex flex-col items-center justify-center">
                <span className="text-4xl mb-2">📄</span>
                <span className="text-xs font-semibold">Land Doc (View)</span>
              </a>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setSelectedRecord(null)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg border">Close</button>
              {selectedRecord.status === 'PENDING' && (
                <>
                  <button onClick={() => handleUpdateStatus(selectedRecord.id, 'REJECTED')} disabled={loadingId === selectedRecord.id} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200">Reject</button>
                  <button onClick={() => handleUpdateStatus(selectedRecord.id, 'VERIFIED')} disabled={loadingId === selectedRecord.id} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Approve & Verify</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Submitted By</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Land Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8">No KYC submissions found.</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {r.full_name}
                  </td>
                  <td className="px-6 py-4">{r.phone_number}</td>
                  <td className="px-6 py-4">{r.land_type}</td>
                  <td className="px-6 py-4">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      r.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      r.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => setSelectedRecord(r)}
                      className="text-teal-600 font-semibold hover:underline"
                    >
                      Review
                    </button>
                    <button 
                      onClick={() => handleManualWhatsApp(r)}
                      className="text-slate-400 hover:text-green-600 transition"
                      title="Trigger Admin WhatsApp"
                    >
                      💬
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
