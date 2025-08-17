'use client'

import { useState } from 'react'
import { getClient } from '@/lib/supabase/client'

export default function DebugDatabasePage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    console.log(message)
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testBasicConnection = async () => {
    setIsLoading(true)
    addLog('🔍 Starting basic connection test...')
    
    try {
      addLog('🔍 Step 1: Creating Supabase client')
      const client = getClient()
      addLog('✅ Step 1: Client created successfully')
      
      addLog('🔍 Step 2: Testing simple query with timeout')
      
      // Create a promise that will timeout after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
      })
      
      // Create the actual query
      const queryPromise = client
        .from('user_profiles')
        .select('id')
        .limit(1)
      
      addLog('🔍 Step 2a: Query created, executing...')
      
      // Race between the query and timeout
      const result = await Promise.race([queryPromise, timeoutPromise])
      
      addLog('✅ Step 2: Query completed successfully')
      addLog(`📊 Step 2 Result: ${JSON.stringify(result)}`)
      
    } catch (error: any) {
      if (error.message?.includes('timeout')) {
        addLog('❌ Step 2: Query TIMED OUT after 5 seconds')
        addLog('💡 This confirms the query is hanging and not reaching Supabase')
      } else {
        addLog(`❌ Step 2: Query failed with error: ${error.message}`)
      }
    }
    
    setIsLoading(false)
  }

  const testEnvironmentVariables = () => {
    addLog('🔍 Testing environment variables...')
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    addLog(`📋 SUPABASE_URL: ${url ? `${url.substring(0, 30)}...` : 'MISSING'}`)
    addLog(`📋 ANON_KEY: ${key ? 'Present' : 'MISSING'}`)
    
    if (url) {
      try {
        new URL(url)
        addLog('✅ URL format is valid')
      } catch {
        addLog('❌ URL format is invalid')
      }
    }
  }

  const testClientCreation = () => {
    addLog('🔍 Testing client creation step by step...')
    
    try {
      addLog('🔍 Step A: Importing createBrowserClient')
      const { createBrowserClient } = require('@supabase/ssr')
      addLog('✅ Step A: Import successful')
      
      addLog('🔍 Step B: Getting environment variables')
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      addLog('✅ Step B: Environment variables obtained')
      
      addLog('🔍 Step C: Creating browser client')
      const client = createBrowserClient(url, key)
      addLog('✅ Step C: Browser client created')
      
      addLog(`📊 Client type: ${typeof client}`)
      addLog(`📊 Client has from method: ${typeof client.from === 'function'}`)
      addLog(`📊 Client has auth method: ${typeof client.auth === 'object'}`)
      
    } catch (error: any) {
      addLog(`❌ Client creation failed: ${error.message}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Database Connection Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testEnvironmentVariables}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isLoading}
        >
          Test Environment Variables
        </button>
        
        <button
          onClick={testClientCreation}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={isLoading}
        >
          Test Client Creation
        </button>
        
        <button
          onClick={testBasicConnection}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Database Query'}
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
        <h3 className="font-bold mb-2">Test Results:</h3>
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
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">What to look for:</h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Environment variables should be present and valid</li>
          <li>• Client creation should succeed without errors</li>
          <li>• Database query should either succeed or show a specific error</li>
          <li>• If query times out, the issue is in the Supabase client configuration</li>
          <li>• Check browser Network tab for any HTTP requests to Supabase</li>
        </ul>
      </div>
    </div>
  )
}