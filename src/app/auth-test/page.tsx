'use client'

import { useAuthContext } from '@/providers/AuthProvider'
import { getSupabaseSingleton } from '@/lib/supabase/singleton'
import { useState, useEffect } from 'react'

export default function AuthTestPage() {
  console.log('🔍 AuthTestPage component rendered')
  const { user, profile, loading } = useAuthContext()
  const [sessionTest, setSessionTest] = useState<any>(null)

  useEffect(() => {
    // Manual session check
    const checkSession = async () => {
      const supabase = getSupabaseSingleton()
      const { data, error } = await supabase.auth.getSession()
      setSessionTest({ data, error })
    }
    checkSession()
    
    // Check localStorage for session data
    const storageCheck = () => {
      const keys = Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('supabase') || key.includes('formulapm'))
      return keys.map(key => ({
        key,
        value: localStorage.getItem(key)?.substring(0, 100) + '...' // Truncate for readability
      }))
    }
    
    setSessionTest((prev: any) => ({
      ...prev,
      localStorage: storageCheck()
    }))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        <h2>AuthProvider Hook State:</h2>
        <p><strong>Loading:</strong> {loading.toString()}</p>
        <p><strong>User:</strong> {user ? `${user.email} (ID: ${user.id})` : 'null'}</p>
        <p><strong>Profile:</strong> {profile ? `${profile.email} (ID: ${profile.id})` : 'null'}</p>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        <h2>Direct Session Check:</h2>
        <pre>{JSON.stringify(sessionTest, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ marginRight: '10px', padding: '10px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Go to Login
        </a>
        <a href="/dashboard" style={{ padding: '10px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}