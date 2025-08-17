'use client'

import { useState } from 'react'

export default function DebugNetworkPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    console.log(message)
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDirectSupabaseConnection = async () => {
    setIsLoading(true)
    addLog('🔍 Testing direct connection to Supabase...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const restApiUrl = `${supabaseUrl}/rest/v1/`
    
    try {
      addLog(`🔍 Testing direct HTTP connection to: ${restApiUrl}`)
      
      const response = await fetch(restApiUrl, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json'
        }
      })
      
      addLog(`📊 Response status: ${response.status}`)
      addLog(`📊 Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`)
      
      if (response.ok) {
        addLog('✅ Direct HTTP connection successful!')
        const data = await response.text()
        addLog(`📊 Response preview: ${data.substring(0, 200)}...`)
      } else {
        addLog(`❌ HTTP connection failed: ${response.status} ${response.statusText}`)
      }
      
    } catch (error: any) {
      addLog(`❌ Direct connection failed: ${error.message}`)
      
      if (error.message.includes('fetch')) {
        addLog('💡 This indicates a network-level connectivity issue')
      }
      if (error.message.includes('CORS')) {
        addLog('💡 This indicates a CORS policy issue')
      }
      if (error.message.includes('timeout')) {
        addLog('💡 This indicates the request is timing out')
      }
    }
    
    setIsLoading(false)
  }

  const testSpecificTable = async () => {
    setIsLoading(true)
    addLog('🔍 Testing specific table access...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const tableUrl = `${supabaseUrl}/rest/v1/user_profiles?select=id&limit=1`
    
    try {
      addLog(`🔍 Testing table query: ${tableUrl}`)
      
      const response = await fetch(tableUrl, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json'
        }
      })
      
      addLog(`📊 Table query status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addLog('✅ Table query successful!')
        addLog(`📊 Data received: ${JSON.stringify(data)}`)
      } else {
        const errorText = await response.text()
        addLog(`❌ Table query failed: ${response.status}`)
        addLog(`📊 Error details: ${errorText}`)
      }
      
    } catch (error: any) {
      addLog(`❌ Table query failed: ${error.message}`)
    }
    
    setIsLoading(false)
  }

  const testSupabaseJSvsDirectFetch = async () => {
    setIsLoading(true)
    addLog('🔍 Comparing Supabase JS vs Direct Fetch...')
    
    // Test 1: Direct fetch (should work)
    try {
      addLog('🔍 Test 1: Direct fetch to Supabase REST API')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=id&limit=1`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        }
      })
      
      if (response.ok) {
        addLog('✅ Direct fetch: SUCCESS')
      } else {
        addLog(`❌ Direct fetch: FAILED (${response.status})`)
      }
    } catch (error: any) {
      addLog(`❌ Direct fetch: ERROR (${error.message})`)
    }
    
    // Test 2: Supabase JS client (currently hanging)
    try {
      addLog('🔍 Test 2: Supabase JS client')
      const { createBrowserClient } = require('@supabase/ssr')
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Set a 3-second timeout for this test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout after 3 seconds')), 3000)
      })
      
      const queryPromise = client.from('user_profiles').select('id').limit(1)
      
      const result = await Promise.race([queryPromise, timeoutPromise])
      addLog('✅ Supabase JS: SUCCESS')
      
    } catch (error: any) {
      if (error.message.includes('Timeout')) {
        addLog('❌ Supabase JS: TIMEOUT (hangs)')
      } else {
        addLog(`❌ Supabase JS: ERROR (${error.message})`)
      }
    }
    
    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Network Connectivity Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testDirectSupabaseConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isLoading}
        >
          Test Direct HTTP Connection
        </button>
        
        <button
          onClick={testSpecificTable}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={isLoading}
        >
          Test Table Access
        </button>
        
        <button
          onClick={testSupabaseJSvsDirectFetch}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          disabled={isLoading}
        >
          Compare JS Client vs Direct Fetch
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          disabled={isLoading}
        >
          Clear Results
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg min-h-[300px] font-mono text-sm overflow-y-auto">
        <h3 className="font-bold mb-2">Network Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">Click a test button to see results...</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1 whitespace-pre-wrap">
              {result}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">Network Diagnostics:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• <strong>Direct HTTP test</strong>: Bypasses Supabase JS library entirely</li>
          <li>• <strong>Table access test</strong>: Tests specific table permissions and RLS</li>
          <li>• <strong>JS vs Fetch comparison</strong>: Identifies if the issue is in Supabase JS library</li>
          <li>• <strong>Watch Network tab</strong>: Look for HTTP requests in browser DevTools</li>
        </ul>
      </div>
    </div>
  )
}