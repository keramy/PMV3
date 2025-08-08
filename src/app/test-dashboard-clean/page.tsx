'use client'

import { useState } from 'react'

interface TestResult {
  api: string
  status: 'pass' | 'fail' | 'testing'
  response?: any
  error?: string
  duration?: number
}

export default function CleanDashboardTest() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  // Only dashboard APIs - NO weather, NO safety metrics
  const apis = [
    { name: 'Activity Feed', url: '/api/dashboard/activity' },
    { name: 'Critical Tasks', url: '/api/dashboard/critical-tasks' },
    { name: 'Metrics', url: '/api/dashboard/metrics' },
    { name: 'Project Progress', url: '/api/dashboard/project-progress' },
    { name: 'Role Data', url: '/api/dashboard/role-data' }
  ]

  const adminUserId = '2c481dc9-90f6-45b4-a5c7-d4c98add23e5'

  const runTests = async () => {
    setTesting(true)
    setResults([])

    for (const api of apis) {
      console.log(`Testing: ${api.name}`)
      const start = Date.now()
      
      try {
        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'x-user-id': adminUserId,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        const duration = Date.now() - start

        console.log(`${api.name} response:`, { status: response.status, data })

        const result: TestResult = {
          api: api.name,
          status: response.ok ? 'pass' : 'fail',
          response: response.ok ? data : undefined,
          error: !response.ok ? `${response.status}: ${data.error || 'Unknown error'}` : undefined,
          duration
        }

        setResults(prev => [...prev, result])

      } catch (error) {
        console.error(`${api.name} error:`, error)
        setResults(prev => [...prev, {
          api: api.name,
          status: 'fail',
          error: error instanceof Error ? error.message : 'Network error',
          duration: Date.now() - start
        }])
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setTesting(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Clean Dashboard API Test</h1>
      <p>Testing only the 5 dashboard APIs with authentication</p>
      
      <button
        onClick={runTests}
        disabled={testing}
        style={{
          padding: '10px 20px',
          backgroundColor: testing ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {testing ? 'Testing...' : 'Test Dashboard APIs'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: result.status === 'pass' ? '#f0f9f0' : result.status === 'fail' ? '#fff0f0' : '#f0f8ff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>{result.api}</h3>
              <span style={{ fontSize: '20px' }}>
                {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳'}
              </span>
            </div>
            
            <div style={{ fontSize: '14px' }}>
              <div><strong>Status:</strong> {result.status.toUpperCase()}</div>
              {result.duration && <div><strong>Duration:</strong> {result.duration}ms</div>}
              {result.error && (
                <div style={{ color: 'red' }}>
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>

            {result.response && (
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer' }}>View Response</summary>
                <pre style={{ 
                  fontSize: '10px', 
                  backgroundColor: 'white', 
                  padding: '10px', 
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  marginTop: '5px'
                }}>
                  {JSON.stringify(result.response, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Test Configuration:</h3>
        <ul>
          <li><strong>User ID:</strong> {adminUserId}</li>
          <li><strong>Auth Header:</strong> x-user-id</li>
          <li><strong>APIs Count:</strong> {apis.length}</li>
          <li><strong>Weather API:</strong> NOT INCLUDED</li>
          <li><strong>Safety Metrics:</strong> NOT INCLUDED</li>
        </ul>
      </div>
    </div>
  )
}