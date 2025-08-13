'use client'

import { useState } from 'react'

export default function RedirectTestPage() {
  const [redirectStatus, setRedirectStatus] = useState<string>('Ready to test')

  const testRedirect = () => {
    setRedirectStatus('Redirecting in 3 seconds...')
    console.log('Starting redirect test')
    
    setTimeout(() => {
      console.log('Attempting redirect to dashboard')
      try {
        setRedirectStatus('Redirecting now...')
        window.location.href = '/dashboard'
      } catch (error) {
        console.error('Redirect failed:', error)
        setRedirectStatus('Redirect failed: ' + error)
      }
    }, 3000)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Redirect Test Page</h1>
      <p>Status: {redirectStatus}</p>
      <button 
        onClick={testRedirect}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Redirect to Dashboard
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ marginRight: '10px' }}>← Back to Login</a>
        <a href="/dashboard">Manual Dashboard Link →</a>
      </div>
    </div>
  )
}