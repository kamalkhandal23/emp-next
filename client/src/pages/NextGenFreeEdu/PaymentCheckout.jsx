import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function PaymentCheckout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const session = params.get('session')
  const registrationId = params.get('registrationId')
  const [status, setStatus] = useState('ready')

  const handleSimulatePay = async () => {
    setStatus('processing')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://emp-new-iksg-git-main-teamoflifeboxs-projects.vercel.app/api'}/nextgen/student/payment/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session || 'mock', status: 'SUCCESS', registrationId })
      })
      if (res.ok) {
        // Redirect back to enrollment success page or registration status
        navigate('/nextgen/enroll?paid=1')
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>Mock Payment Checkout</h1>
      <p>Session: <strong>{session}</strong></p>
      <p>Registration: <strong>{registrationId}</strong></p>
      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={handleSimulatePay} style={{ padding: '0.75rem 1.25rem', background: '#f59e0b', border: 'none', color: 'white', borderRadius: 8 }}>
          {status === 'processing' ? 'Processing...' : 'Simulate Pay (Mock)'}
        </button>
        {status === 'error' && <p style={{ color: 'red' }}>Payment failed. Try again.</p>}
      </div>
    </div>
  )
}
