/**
 * Material Specs API Test Page
 * Test the new Material Specs API endpoints
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import type { MaterialSpec, MaterialSpecFormData, MaterialSpecReviewData } from '@/types/material-specs'

export default function TestMaterialSpecsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [createdSpecId, setCreatedSpecId] = useState<string | null>(null)

  const addResult = (test: string, data: any, success: boolean = true) => {
    setResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      test,
      success,
      data
    }])
  }

  const testGetMaterialSpecs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/material-specs?project_id=1&limit=5')
      const data = await response.json()
      
      if (response.ok) {
        addResult('GET /api/material-specs', data)
      } else {
        addResult('GET /api/material-specs', data, false)
      }
    } catch (error) {
      addResult('GET /api/material-specs', { error: error instanceof Error ? error.message : 'Unknown error' }, false)
    } finally {
      setLoading(false)
    }
  }

  const testCreateMaterialSpec = async () => {
    setLoading(true)
    try {
      const newSpec: MaterialSpecFormData = {
        name: 'Test Steel Beam - API Test',
        category: 'metal',
        priority: 'medium',
        manufacturer: 'Test Steel Co',
        model: 'TSB-2024',
        spec_number: 'TSB-001',
        specification: 'High-strength steel beam for load-bearing applications',
        unit: 'each',
        quantity: 5,
        unit_cost: 1250.00,
        supplier: 'Construction Supply Ltd',
        notes: 'API test spec - can be deleted'
      }

      const response = await fetch('/api/material-specs?project_id=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSpec)
      })

      const data = await response.json()
      
      if (response.ok) {
        setCreatedSpecId(data.id)
        addResult('POST /api/material-specs', data)
      } else {
        addResult('POST /api/material-specs', data, false)
      }
    } catch (error) {
      addResult('POST /api/material-specs', { error: error instanceof Error ? error.message : 'Unknown error' }, false)
    } finally {
      setLoading(false)
    }
  }

  const testGetSingleSpec = async () => {
    if (!createdSpecId) {
      addResult('GET /api/material-specs/[id]', { error: 'No spec ID available. Create a spec first.' }, false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/material-specs/${createdSpecId}`)
      const data = await response.json()
      
      if (response.ok) {
        addResult('GET /api/material-specs/[id]', data)
      } else {
        addResult('GET /api/material-specs/[id]', data, false)
      }
    } catch (error) {
      addResult('GET /api/material-specs/[id]', { error: error instanceof Error ? error.message : 'Unknown error' }, false)
    } finally {
      setLoading(false)
    }
  }

  const testUpdateSpec = async () => {
    if (!createdSpecId) {
      addResult('PUT /api/material-specs/[id]', { error: 'No spec ID available. Create a spec first.' }, false)
      return
    }

    setLoading(true)
    try {
      const updateData = {
        notes: 'Updated via API test - ' + new Date().toISOString(),
        quantity: 7,
        unit_cost: 1300.00
      }

      const response = await fetch(`/api/material-specs/${createdSpecId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult('PUT /api/material-specs/[id]', data)
      } else {
        addResult('PUT /api/material-specs/[id]', data, false)
      }
    } catch (error) {
      addResult('PUT /api/material-specs/[id]', { error: error instanceof Error ? error.message : 'Unknown error' }, false)
    } finally {
      setLoading(false)
    }
  }

  const testPMApproval = async () => {
    if (!createdSpecId) {
      addResult('POST /api/material-specs/[id]/review', { error: 'No spec ID available. Create a spec first.' }, false)
      return
    }

    setLoading(true)
    try {
      const reviewData: MaterialSpecReviewData = {
        status: 'approved',
        review_notes: 'Approved via API test - meets project requirements'
      }

      const response = await fetch(`/api/material-specs/${createdSpecId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult('POST /api/material-specs/[id]/review', data)
      } else {
        addResult('POST /api/material-specs/[id]/review', data, false)
      }
    } catch (error) {
      addResult('POST /api/material-specs/[id]/review', { error: error instanceof Error ? error.message : 'Unknown error' }, false)
    } finally {
      setLoading(false)
    }
  }

  const testGetReviewHistory = async () => {
    if (!createdSpecId) {
      addResult('GET /api/material-specs/[id]/review', { error: 'No spec ID available. Create a spec first.' }, false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/material-specs/${createdSpecId}/review`)
      const data = await response.json()
      
      if (response.ok) {
        addResult('GET /api/material-specs/[id]/review', data)
      } else {
        addResult('GET /api/material-specs/[id]/review', data, false)
      }
    } catch (error) {
      addResult('GET /api/material-specs/[id]/review', { error: error instanceof Error ? error.message : 'Unknown error' }, false)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setCreatedSpecId(null)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Material Specs API Tests</h1>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button 
              onClick={testGetMaterialSpecs} 
              disabled={loading}
              variant="outline"
            >
              List Specs
            </Button>
            <Button 
              onClick={testCreateMaterialSpec} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Spec
            </Button>
            <Button 
              onClick={testGetSingleSpec} 
              disabled={loading || !createdSpecId}
              variant="outline"
            >
              Get Single
            </Button>
            <Button 
              onClick={testUpdateSpec} 
              disabled={loading || !createdSpecId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Spec
            </Button>
            <Button 
              onClick={testPMApproval} 
              disabled={loading || !createdSpecId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              PM Approve
            </Button>
            <Button 
              onClick={testGetReviewHistory} 
              disabled={loading || !createdSpecId}
              variant="outline"
            >
              Review History
            </Button>
          </div>

          {createdSpecId && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <strong>Created Spec ID:</strong> {createdSpecId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{result.test}</CardTitle>
                <div className="flex gap-2 items-center">
                  <Badge variant={result.success ? 'default' : 'destructive'}>
                    {result.success ? 'SUCCESS' : 'ERROR'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(result.data, null, 2)}
                readOnly
                className="font-mono text-sm min-h-[200px]"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No test results yet. Click a test button to begin.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}