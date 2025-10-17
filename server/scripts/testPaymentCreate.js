import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:5002/api/nextgen/student/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: 'Test Student', email: 'test@example.com', phone: '+919999999999', course_id: 'fullstack', amount: 49900 })
  })
  const json = await res.json().catch(() => null)
  console.log('Status:', res.status)
  console.log('Body:', json)
}

test().catch(err => console.error(err))
