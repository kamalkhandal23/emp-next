import fetch from 'node-fetch'

const API = process.env.API_BASE || 'https://emp-new-2.onrender.com/api'

async function run() {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    password: 'Password1',
    department: 'Engineering',
    position: 'Developer'
  }

  console.log('Registering user:', testUser.email)
  let res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  })
  let json = await res.json().catch(() => null)
  console.log('Register status:', res.status, json)

  console.log('Logging in...')
  res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  })
  json = await res.json().catch(() => null)
  console.log('Login status:', res.status, json)
}

run().catch(err => {
  console.error('Test script error:', err)
  process.exit(1)
})
