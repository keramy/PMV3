'use client'

import { useState } from 'react'

export default function SimpleTestPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-simple')
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setResults({ 
        error: err instanceof Error ? err.message : 'Test failed',
        success: false 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Simple Database Connection Test</h1>
      
      <button
        onClick={runTest}
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
        {loading ? 'Testing...' : 'Run Simple Test'}
      </button>

      {results && (
        <div style={{
          padding: '15px',
          backgroundColor: results.success ? '#d4edda' : '#f8d7da',
          color: results.success ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          <h3>Test Results:</h3>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '12px',
            maxHeight: '500px',
            overflow: 'auto',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>This test checks:</strong></p>
        <ul>
          <li>Environment variables are present</li>
          <li>Direct Supabase connection works</li>
          <li>All 13 core tables accessible: companies, user_profiles, subcontractors, projects, project_members, scope_items, shop_drawings, material_specs, tasks, rfis, change_orders, punch_items, activity_logs</li>
        </ul>
      </div>
    </div>
  )
}