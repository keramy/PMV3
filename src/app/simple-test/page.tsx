'use client'

import { useState, useEffect } from 'react'

export default function SimpleTestPage() {
  const [jsWorking, setJsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [browserInfo, setBrowserInfo] = useState<string>('')

  useEffect(() => {
    console.log('🔍 Simple test component mounted')
    setJsWorking(true)
    
    // Set browser info to avoid hydration mismatch
    setBrowserInfo(window.navigator.userAgent)
    
    // Test if we can access localStorage
    try {
      localStorage.setItem('test-key', 'test-value')
      const value = localStorage.getItem('test-key')
      console.log('🔍 localStorage test:', value)
      localStorage.removeItem('test-key')
    } catch (err) {
      setError('localStorage not working: ' + err)
    }
  }, [])

  const testSupabaseImport = async () => {
    try {
      console.log('🔍 Testing Supabase import...')
      const { getSupabaseSingleton } = await import('@/lib/supabase/singleton')
      console.log('🔍 Supabase client import successful')
      
      const supabase = getSupabaseSingleton()
      console.log('🔍 Supabase client created:', !!supabase)
      
      const { data, error } = await supabase.auth.getSession()
      console.log('🔍 Session check result:', { session: !!data.session, error: error?.message })
      
      setError(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('🔍 Supabase test error:', errorMsg)
      setError('Supabase error: ' + errorMsg)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple JavaScript & Supabase Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>JavaScript Working:</strong> {jsWorking ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
      </div>
      
      <button 
        onClick={testSupabaseImport}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Test Supabase Client
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Browser Info:</h3>
        <p>User Agent: {browserInfo || 'Loading...'}</p>
        <p>Local Storage Available: {jsWorking ? 'Yes' : 'Checking...'}</p>
      </div>
    </div>
  )
}