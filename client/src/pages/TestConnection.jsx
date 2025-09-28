import { useState, useEffect } from 'react'
import apiClient from '../utils/api'

export default function TestConnection() {
  const [status, setStatus] = useState('checking')
  const [serverInfo, setServerInfo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus('checking')
      setError(null)
      
      // Test basic server connection
      const response = await fetch('http://localhost:5002/health')
      const data = await response.json()
      
      setServerInfo(data)
      setStatus('connected')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const testLogin = async () => {
    try {
      setStatus('testing-login')
      
      const response = await apiClient.login({
        email: 'john.doe@lifeboxnextgen.com',
        password: 'employee123'
      })
      
      console.log('Login successful:', response)
      setStatus('login-success')
    } catch (err) {
      console.error('Login failed:', err)
      setError(err.message)
      setStatus('login-error')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Connection Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Server Status</h2>
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          background: status === 'connected' ? '#dcfce7' : status === 'error' ? '#fef2f2' : '#f3f4f6',
          border: `1px solid ${status === 'connected' ? '#22c55e' : status === 'error' ? '#ef4444' : '#d1d5db'}`
        }}>
          <p><strong>Status:</strong> {status}</p>
          {serverInfo && (
            <div>
              <p><strong>Server:</strong> {serverInfo.status}</p>
              <p><strong>Environment:</strong> {serverInfo.environment}</p>
              <p><strong>Version:</strong> {serverInfo.version}</p>
              <p><strong>Uptime:</strong> {Math.floor(serverInfo.uptime)} seconds</p>
            </div>
          )}
          {error && (
            <p style={{ color: '#ef4444' }}><strong>Error:</strong> {error}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={testConnection}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Test Connection
        </button>
        
        <button 
          onClick={testLogin}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
          disabled={status !== 'connected'}
        >
          Test Login
        </button>
      </div>

      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure the server is running on port 5002</li>
          <li>Run: <code>cd server && npm run dev</code></li>
          <li>The server should be accessible at http://localhost:5002</li>
          <li>Test the connection using the button above</li>
          <li>If successful, test the login with demo credentials</li>
        </ol>
      </div>
    </div>
  )
}