'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'

interface TestResult {
  test: string
  status: 'pass' | 'fail' | 'skip'
  message: string
  data?: any
  duration?: number
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  duration: string
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<TestSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setLoading(true)
    setError(null)
    setResults([])
    setSummary(null)

    try {
      const response = await fetch('/api/test')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Test failed')
      }

      setResults(data.results || [])
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test suite failed')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'skip':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200'
      case 'fail':
        return 'bg-red-50 border-red-200'
      case 'skip':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6" />
            Formula PM V3 - API Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of core system functionality, database connections, and API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Run Tests Button */}
          <div className="flex gap-4">
            <Button 
              onClick={runTests} 
              disabled={loading}
              className="gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Test Suite Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                    <div className="text-sm text-blue-600">Total Tests</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                    <div className="text-sm text-green-600">Passed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{summary.duration}</div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              
              {results.map((result, index) => (
                <Card key={index} className={getStatusColor(result.status)}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                        <Badge variant={
                          result.status === 'pass' ? 'default' :
                          result.status === 'fail' ? 'destructive' : 'secondary'
                        }>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      {result.duration && (
                        <span className="text-xs text-gray-500">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                    
                    {result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-white rounded border overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Instructions */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Test Coverage:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>🔧 <strong>Environment Variables</strong> - Verifies all required env vars are present</li>
                <li>🗄️ <strong>Database Connection</strong> - Tests Supabase connection and basic queries</li>
                <li>📋 <strong>Core Tables</strong> - Validates all 13 construction tables exist and are accessible</li>
                <li>⚡ <strong>User Profile Trigger</strong> - Checks automatic profile creation trigger</li>
                <li>🔐 <strong>Permissions System</strong> - Tests dynamic permission array structure</li>
                <li>🔒 <strong>API Authentication</strong> - Verifies auth mechanism is ready</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Expected Result:</strong> All tests should pass for a healthy system ready for production features.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}