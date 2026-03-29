import { NextResponse } from 'next/server'

// MOCK WHATSAPP API INTEGRATION
// Replace this with actual Twilio / Meta Cloud API / Green API call
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { trigger, payload } = body

    const TARGET_NUMBER = '9361044698'

    let message = ''

    switch (trigger) {
      case 'KYC_SUBMITTED':
        message = `🔔 *New KYC Submitted*\n\nName: ${payload.name}\nPhone: ${payload.phone}\nLand Type: ${payload.landType}\nSize: ${payload.landSize}\n\nReview in Admin Dashboard.`
        break
      case 'BUYER_REQUEST':
        message = `🏠 *New Buyer Requirement*\n\nName: ${payload.name}\nPhone: ${payload.phone}\nLocation: ${payload.location}\nBudget: ${payload.budget}\nDetails: ${payload.requirements}`
        break
      case 'BUYER_INTEREST':
        // This is triggered from the property detail page when a buyer clicks "Contact Seller"
        message = `🤝 *New Property Lead*\n\nBuyer: ${payload.buyerName} (${payload.buyerPhone})\nInterested in Property ID: ${payload.propertyId}\n\n*Auto-sending verified seller docs to buyer now...*`
        break
      default:
        message = `Generic Notification: ${JSON.stringify(payload)}`
    }

    // --- MOCK API CALL START ---
    console.log('\n========================================')
    console.log(`📡 [WHATSAPP API MOCK] Sending to ${TARGET_NUMBER}`)
    console.log('📝 MESSAGE CONTENT:')
    console.log(message)
    console.log('========================================\n')
    // --- MOCK API CALL END ---

    // TODO: Await actual axios/fetch call to WA Provider here
    // example: await fetch('https://api.whatsapp-provider.com/send', { ... })

    return NextResponse.json({ success: true, message: 'WhatsApp notification triggered' })
  } catch (error) {
    console.error('WhatsApp API Error:', error)
    return NextResponse.json({ error: 'Failed to trigger WhatsApp' }, { status: 500 })
  }
}
