/**
 * Cookie Debugger - View all cookies for authentication debugging
 */

'use client'

import { useState, useEffect } from 'react'

export function CookieDebugger() {
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie)
  }, [])

  const parseCookies = () => {
    if (!cookies) return []
    
    return cookies.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=')
      return { name, value: value || '' }
    }).filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('sb-') ||
      cookie.name.includes('access') ||
      cookie.name.includes('refresh')
    )
  }

  const analyzeTokens = () => {
    const supabaseCookies = parseCookies()
    const tokenInfo = {
      hasAccessToken: false,
      hasRefreshToken: false,
      accessTokenExpiry: null as string | null,
      cookieCount: supabaseCookies.length
    }

    supabaseCookies.forEach(cookie => {
      if (cookie.name.includes('access') || cookie.value.includes('.')) {
        tokenInfo.hasAccessToken = true
        // Try to decode JWT payload for expiry
        try {
          const parts = cookie.value.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]))
            if (payload.exp) {
              tokenInfo.accessTokenExpiry = new Date(payload.exp * 1000).toLocaleString()
            }
          }
        } catch (e) {
          // Ignore decode errors
        }
      }
      if (cookie.name.includes('refresh')) {
        tokenInfo.hasRefreshToken = true
      }
    })

    return tokenInfo
  }

  const refreshCookies = () => {
    setCookies(document.cookie)
  }

  const supabaseCookies = parseCookies()
  const tokenInfo = analyzeTokens()

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc',
      padding: '10px',
      maxWidth: '450px',
      fontSize: '12px',
      zIndex: 1000,
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <strong>🍪 Auth Cookie Debugger</strong>
        <button 
          onClick={refreshCookies} 
          style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 6px' }}
        >
          🔄 Refresh
        </button>
      </div>
      
      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Session Status:</strong>
        <div>🍪 Cookies Found: <strong>{tokenInfo.cookieCount}</strong></div>
        <div>🔑 Access Token: <span style={{ color: tokenInfo.hasAccessToken ? 'green' : 'red' }}>
          {tokenInfo.hasAccessToken ? '✅ Present' : '❌ Missing'}
        </span></div>
        <div>🔄 Refresh Token: <span style={{ color: tokenInfo.hasRefreshToken ? 'green' : 'red' }}>
          {tokenInfo.hasRefreshToken ? '✅ Present' : '❌ Missing'}
        </span></div>
        {tokenInfo.accessTokenExpiry && (
          <div>⏰ Token Expires: <strong>{tokenInfo.accessTokenExpiry}</strong></div>
        )}
      </div>
      
      {supabaseCookies.length > 0 ? (
        <div>
          <strong>Cookie Details:</strong>
          {supabaseCookies.map((cookie, i) => (
            <div key={i} style={{ 
              margin: '8px 0', 
              padding: '6px', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '3px',
              wordBreak: 'break-all',
              fontSize: '11px'
            }}>
              <strong>{cookie.name}:</strong><br/>
              <span style={{ color: '#666' }}>
                {cookie.value.length > 100 ? `${cookie.value.substring(0, 100)}...` : cookie.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          ❌ No authentication cookies found - login may have failed
        </div>
      )}
    </div>
  )
}