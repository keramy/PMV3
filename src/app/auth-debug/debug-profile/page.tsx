'use client'

import { useState, useEffect } from 'react'
import { getClient } from '@/lib/supabase/client'

export default function ProfileDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDebugTests = async () => {
      const client = getClient()
      const debug: any = {
        timestamp: new Date().toISOString(),
        tests: {}
      }

      try {
        // Test 1: Check client configuration
        debug.tests.clientConfig = {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
        }

        // Test 2: Check current session
        console.log('🔍 Debug: Getting session...')
        const { data: sessionData, error: sessionError } = await client.auth.getSession()
        debug.tests.session = {
          hasSession: !!sessionData.session,
          user: sessionData.session?.user ? {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            exp: sessionData.session.expires_at
          } : null,
          error: sessionError?.message || null
        }

        // Test 3: Check current user
        console.log('🔍 Debug: Getting user...')
        const { data: userData, error: userError } = await client.auth.getUser()
        debug.tests.user = {
          hasUser: !!userData.user,
          user: userData.user ? {
            id: userData.user.id,
            email: userData.user.email
          } : null,
          error: userError?.message || null
        }

        // Test 4: Direct profile query (bypassing getCurrentUserProfile)
        if (userData.user) {
          console.log('🔍 Debug: Querying profile directly...')
          const { data: profileData, error: profileError } = await client
            .from('user_profiles')
            .select('*')
            .eq('id', userData.user.id)
            .single()

          debug.tests.profileQuery = {
            hasProfile: !!profileData,
            profile: profileData ? {
              id: profileData.id,
              email: profileData.email,
              job_title: profileData.job_title,
              permissions: profileData.permissions?.length || 0
            } : null,
            error: profileError?.message || null,
            errorCode: profileError?.code || null
          }
        }

        // Test 5: Test simple query
        console.log('🔍 Debug: Testing simple query...')
        const { data: testData, error: testError } = await client
          .from('user_profiles')
          .select('id, email')
          .limit(1)

        debug.tests.simpleQuery = {
          hasData: !!testData,
          count: testData?.length || 0,
          error: testError?.message || null
        }

      } catch (error) {
        debug.tests.generalError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : null
        }
      }

      console.log('🔍 Complete debug info:', debug)
      setDebugInfo(debug)
      setLoading(false)
    }

    runDebugTests()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Profile Debug - Running Tests...</h1>
        <div className="animate-pulse">Testing authentication and profile queries...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile Authentication Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Timestamp</h2>
          <code className="text-sm">{debugInfo.timestamp}</code>
        </div>

        {debugInfo.tests?.clientConfig && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Client Configuration</h2>
            <pre className="text-sm">{JSON.stringify(debugInfo.tests.clientConfig, null, 2)}</pre>
          </div>
        )}

        {debugInfo.tests?.session && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Session Test</h2>
            <pre className="text-sm">{JSON.stringify(debugInfo.tests.session, null, 2)}</pre>
          </div>
        )}

        {debugInfo.tests?.user && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">User Test</h2>
            <pre className="text-sm">{JSON.stringify(debugInfo.tests.user, null, 2)}</pre>
          </div>
        )}

        {debugInfo.tests?.profileQuery && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Profile Query Test</h2>
            <pre className="text-sm">{JSON.stringify(debugInfo.tests.profileQuery, null, 2)}</pre>
          </div>
        )}

        {debugInfo.tests?.simpleQuery && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Simple Query Test</h2>
            <pre className="text-sm">{JSON.stringify(debugInfo.tests.simpleQuery, null, 2)}</pre>
          </div>
        )}

        {debugInfo.tests?.generalError && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">General Error</h2>
            <pre className="text-sm">{JSON.stringify(debugInfo.tests.generalError, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-2">Debug Actions</h2>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Reload Tests
        </button>
        <button 
          onClick={() => navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))} 
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Copy Debug Info
        </button>
      </div>
    </div>
  )
}