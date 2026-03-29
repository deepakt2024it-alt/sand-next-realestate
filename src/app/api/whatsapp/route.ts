import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { trigger, payload } = body

    // Phone number to receive admin alerts
    const TARGET_NUMBER = '919361044698' 

    let message = ''

    switch (trigger) {
      case 'KYC_SUBMITTED':
        message = `🔔 *New KYC Submitted*\n\nName: ${payload.name}\nPhone: ${payload.phone}\nLand Type: ${payload.landType}\nSize: ${payload.landSize}\n\nReview in Admin Dashboard.`
        break
      case 'BUYER_REQUEST':
        message = `🏠 *New Buyer Requirement*\n\nName: ${payload.name}\nPhone: ${payload.phone}\nLocation: ${payload.location}\nBudget: ${payload.budget}\nDetails: ${payload.requirements}`
        break
      case 'BUYER_INTEREST':
        message = `🤝 *New Property Lead*\n\nBuyer: ${payload.buyerName} (${payload.buyerPhone})\nInterested in Property ID: ${payload.propertyId}\n\n*Auto-sending verified seller docs to buyer now...*`
        break
      default:
        message = `Generic Notification: ${JSON.stringify(payload)}`
    }

    const instanceId = process.env.ULTRAMSG_INSTANCE_ID
    const token = process.env.ULTRAMSG_TOKEN

    if (!instanceId || !token) {
      console.log("No UltraMsg credentials found. Message generated but not sent:", message)
      return NextResponse.json({ success: true, message: 'Simulated (No API keys)' })
    }

    const url = `https://api.ultramsg.com/${instanceId}/messages/chat`
    const data = new URLSearchParams()
    data.append("token", token)
    data.append("to", TARGET_NUMBER)
    data.append("body", message)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data
    })

    const result = await response.json()
    console.log("UltraMsg API Response:", result)

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('WhatsApp API Error:', error)
    return NextResponse.json({ error: 'Failed to trigger WhatsApp' }, { status: 500 })
  }
}

