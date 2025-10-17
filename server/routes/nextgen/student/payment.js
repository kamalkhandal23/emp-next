import express from 'express'
import crypto from 'crypto'
import Registration from '../../../models/nextgen/core/Registration.js'

const router = express.Router()

// Environment variables used for PhonePe
// PHONEPE_API_KEY, PHONEPE_MID, PHONEPE_CLIENT_ID, PHONEPE_KEY_INDEX, PHONEPE_BASE_URL, FRONTEND_URL

function signPayload(payload) {
  const apiKey = process.env.PHONEPE_API_KEY || ''
  // HMAC-SHA256 of JSON payload; PhonePe uses specific signing - adjust if needed
  return crypto.createHmac('sha256', apiKey).update(JSON.stringify(payload)).digest('base64')
}

// Create payment: forwards registration and creates a PhonePe transaction
router.post('/create', async (req, res) => {
  try {
    const { full_name, email, phone, course_id, amount } = req.body

    if (!full_name || !email || !course_id || !amount) {
      return res.status(400).json({ success: false, message: 'Missing payment parameters' })
    }

    // Create a registration with payment_pending status
    const registration = await Registration.create({
      full_name,
      email,
      phone,
      course_id,
      status: 'payment_pending'
    })

    // Build the payload expected by the gateway
    const merchantTransactionId = `txn_${registration._id}_${Date.now()}`
    const payload = {
      merchantId: process.env.PHONEPE_MID || process.env.PHONEPE_MERCHANT_ID || '',
      merchantTransactionId,
      amount: amount,
      currency: 'INR',
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/nextgen/payment/verify?registrationId=${registration._id}`,
      additionalInfo: {
        registrationId: registration._id.toString(),
        studentEmail: email
      }
    }

    // Sign payload
    const signature = signPayload(payload)

    const baseUrl = process.env.PHONEPE_BASE_URL || '' // Set to PhonePe sandbox/prod base URL
    if (!baseUrl) {
      // If no real gateway configured, return a local checkout URL to simulate payment
      const paymentSessionId = crypto.randomBytes(16).toString('hex')
      const paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/nextgen/payment/checkout?session=${paymentSessionId}&registrationId=${registration._id}`

      registration.payment_session = {
        session_id: paymentSessionId,
        amount,
        provider: 'phonepe-mock',
        created_at: new Date()
      }
      await registration.save()

      return res.json({ success: true, data: { paymentUrl, registrationId: registration._id } })
    }

    // Call PhonePe create transaction endpoint
    const endpoint = `${baseUrl}/merchantpg/v1/pay`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': process.env.PHONEPE_CLIENT_ID || '',
        'key-index': process.env.PHONEPE_KEY_INDEX || '1',
        'X-VERIFY': signature
      },
      body: JSON.stringify(payload)
    })

    const json = await response.json()
    if (!response.ok) {
      console.error('PhonePe create failed', json)
      return res.status(502).json({ success: false, message: 'Payment gateway error', detail: json })
    }

    // Expecting gateway to return a paymentUrl or deeplink
    const paymentUrl = json?.data?.paymentUrl || json?.data?.callbackUrl || json?.paymentUrl
    registration.payment_session = {
      session_id: merchantTransactionId,
      provider: 'phonepe',
      amount,
      raw: json,
      created_at: new Date()
    }
    await registration.save()

    res.json({ success: true, data: { paymentUrl, registrationId: registration._id, raw: json } })
  } catch (error) {
    console.error('Payment create error:', error)
    res.status(500).json({ success: false, message: 'Server error creating payment' })
  }
})

// Webhook/callback endpoint for payment gateway
router.post('/callback', async (req, res) => {
  try {
    // PhonePe will POST status info - validate signature as required by PhonePe docs
    const body = req.body
    // If phonepe provides a signature header (e.g., 'X-VERIFY'), verify it here
    // const signature = req.headers['x-verify']
    // verify using HMAC and PHONEPE_API_KEY

    const { session_id, status, registrationId, transactionId } = body
    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'Missing callback data' })
    }

    const registration = await Registration.findById(registrationId)
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' })
    }

    registration.payment_session = registration.payment_session || {}
    registration.payment_session.status = status || 'failed'
    registration.payment_session.transactionId = transactionId || null
    if (status === 'SUCCESS' || status === 'success') {
      registration.status = 'submitted' // move to submitted for review after successful payment
    } else {
      registration.status = 'payment_failed'
    }
    await registration.save()

    res.json({ success: true })
  } catch (error) {
    console.error('Payment callback error:', error)
    res.status(500).json({ success: false, message: 'Server error processing callback' })
  }
})

export default router
