'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ApiTestResult {
  api: string
  status: 'pass' | 'fail' | 'testing'
  response?: any
  error?: string
  duration?: number
}

export default function DashboardApiTestPage() {
  const [results, setResults] = useState<ApiTestResult[]>([])
  const [testing, setTesting] = useState(false)

  const dashboardApis = [
    { name: 'Activity Feed', endpoint: '/api/dashboard/activity' },
    { name: 'Critical Tasks', endpoint: '/api/dashboard/critical-tasks' },
    { name: 'Metrics', endpoint: '/api/dashboard/metrics' },
    { name: 'Project Progress', endpoint: '/api/dashboard/project-progress' },
    { name: 'Role Data', endpoint: '/api/dashboard/role-data' }
  ]

  // Our admin user ID from earlier tests
  const adminUserId = '2c481dc9-90f6-45b4-a5c7-d4c98add23e5'

  const testAllApis = async () => {
    setTesting(true)
    setResults([])

    const testResults: ApiTestResult[] = []

    for (const api of dashboardApis) {
      const startTime = Date.now()
      
      try {
        // Update UI to show current test
        setResults(prev => [...prev, {
          api: api.name,
          status: 'testing'
        }])

        const response = await fetch(api.endpoint, {
          headers: {
            'x-user-id': adminUserId,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        const duration = Date.now() - startTime

        const result: ApiTestResult = {
          api: api.name,
          status: response.ok ? 'pass' : 'fail',
          response: response.ok ? data : undefined,
          duration,
          error: !response.ok ? `HTTP ${response.status}: ${data.error || data.message || 'Unknown error'}` : undefined
        }

        testResults.push(result)
        
        // Update results in real-time
        setResults(prev => 
          prev.map(r => r.api === api.name ? result : r)
        )

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 300))

      } catch (error) {
        const result: ApiTestResult = {
          api: api.name,
          status: 'fail',
          error: error instanceof Error ? error.message : 'Network error',
          duration: Date.now() - startTime
        }
        
        testResults.push(result)
        setResults(prev => 
          prev.map(r => r.api === api.name ? result : r)
        )
      }
    }

    setTesting(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50'
      case 'fail': return 'text-red-600 bg-red-50'
      case 'testing': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅'
      case 'fail': return '❌'
      case 'testing': return '⏳'
      default: return '⚪'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard APIs Test Suite</CardTitle>
          <CardDescription>
            Test all dashboard API endpoints to validate data flow and responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={testAllApis} 
            disabled={testing}
            className="w-full"
          >
            {testing ? 'Testing APIs...' : 'Test All Dashboard APIs'}
          </Button>

          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result, index) => (
                <Card key={index} className={`${getStatusColor(result.status)} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{result.api}</span>
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div>Status: <strong>{result.status.toUpperCase()}</strong></div>
                      {result.duration && (
                        <div>Duration: <strong>{result.duration}ms</strong></div>
                      )}
                      {result.error && (
                        <div className="text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                    </div>

                    {result.response && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                          View Response
                        </summary>
                        <pre className="text-xs bg-white p-2 rounded mt-1 max-h-32 overflow-auto">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Dashboard APIs Being Tested:</h4>
              <div className="text-sm">
                <p className="mb-2"><strong>Authentication:</strong> Using admin user ID (2c481dc9-90f6-45b4-a5c7-d4c98add23e5)</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Activity Feed</strong> - Recent project activities and updates</li>
                  <li><strong>Critical Tasks</strong> - Urgent tasks requiring immediate attention</li>
                  <li><strong>Metrics</strong> - Key performance indicators and dashboard stats</li>
                  <li><strong>Project Progress</strong> - Overall project status and completion data</li>
                  <li><strong>Role Data</strong> - User role-specific information and permissions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}