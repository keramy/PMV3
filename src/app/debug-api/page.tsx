'use client'

import { useState } from 'react'

export default function DebugApiPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSingleApi = async () => {
    setLoading(true)
    const adminUserId = '2c481dc9-90f6-45b4-a5c7-d4c98add23e5'
    
    try {
      console.log('Testing with user ID:', adminUserId)
      
      const response = await fetch('/api/dashboard/activity', {
        method: 'GET',
        headers: {
          'x-user-id': adminUserId,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Response data:', data)
      
      setResult({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        requestHeaders: {
          'x-user-id': adminUserId,
          'Content-Type': 'application/json'
        }
      })
      
    } catch (error) {
      console.error('Request error:', error)
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Debug API Test</h1>
      
      <button
        onClick={testSingleApi}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test Activity API'}
      </button>

      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <h3>Debug Results:</h3>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '12px',
            maxHeight: '500px',
            overflow: 'auto',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Debug Info:</strong></p>
        <ul>
          <li>Testing: /api/dashboard/activity</li>
          <li>User ID: 2c481dc9-90f6-45b4-a5c7-d4c98add23e5</li>
          <li>Header: x-user-id</li>
          <li>Check console logs for detailed info</li>
        </ul>
      </div>
    </div>
  )
}