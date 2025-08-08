'use client'

import { useState } from 'react'
import { getClient } from '@/lib/supabase'
import { createTypedQuery, eqFilter } from '@/lib/database-helpers'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleLogin = async () => {
    if (!email || !password) {
      setResult({ error: 'Please fill in both email and password' })
      return
    }

    try {
      setLoading(true)
      setResult(null)

      // Sign in with email and password
      const supabase = getClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setResult({ error: error.message })
        return
      }

      if (data.user) {
        // Fetch user profile using type-safe helper
        const supabase = getClient()
        const profileQuery = createTypedQuery('user_profiles')
        const { data: profile, error: profileError } = await profileQuery
          .select('*')
          .eq('id', data.user.id)
          .single()

        setResult({
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            confirmed: !!data.user.email_confirmed_at,
            lastSignIn: data.user.last_sign_in_at
          },
          profile: profile || null,
          profileError: profileError?.message,
          session: {
            accessToken: data.session?.access_token ? 'Present' : 'Missing',
            refreshToken: data.session?.refresh_token ? 'Present' : 'Missing'
          }
        })

        console.log('Login successful:', data)
        console.log('User profile:', profile)
      }

    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  const checkCurrentSession = async () => {
    try {

      const supabase = getClient()
      const { data, error } = await supabase.auth.getSession()
      
      setResult({
        sessionCheck: true,
        currentSession: data.session ? {
          user: {
            id: data.session.user.id,
            email: data.session.user.email
          },
          expires: data.session.expires_at
        } : null,
        error: error?.message
      })
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Session check failed' })
    }
  }

  const signOut = async () => {
    try {

      const supabase = getClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setResult({ error: error.message })
      } else {
        setResult({ signedOut: true, message: 'Successfully signed out' })
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Sign out failed' })
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Login Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <button
          onClick={checkCurrentSession}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Check Session
        </button>

        <button
          onClick={signOut}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: result.error ? '#f8d7da' : '#d4edda',
          color: result.error ? '#721c24' : '#155724',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Enter the email and password you used to create the admin user</li>
          <li>Click "Sign In" to test login</li>
          <li>Check if user profile data is loaded correctly</li>
          <li>Use "Check Session" to see current authentication state</li>
        </ol>
      </div>
    </div>
  )
}