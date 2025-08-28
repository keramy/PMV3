/**
 * Formula PM V3 - Loading Component Demo Page
 * Showcase different variants of the Formula loader
 */

'use client'

import React, { useState } from 'react'
import { FormulaLoader, FormulaLoading, FormulaLoadingInline } from '@/components/ui/formula-loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoaderDemoPage() {
  const [showLoading, setShowLoading] = useState(false)
  
  const simulateLoading = () => {
    setShowLoading(true)
    setTimeout(() => setShowLoading(false), 3000)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Formula Loading Components Demo
        </h1>
        <p className="text-gray-600">
          Showcasing different variants of the animated Formula loader
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Loader Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Loader - Small</CardTitle>
            <CardDescription>Compact version for tight spaces</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <FormulaLoader size="sm" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Loader - Medium</CardTitle>
            <CardDescription>Default size for most use cases</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <FormulaLoader size="md" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Loader - Large</CardTitle>
            <CardDescription>Prominent loading for main content</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <FormulaLoader size="lg" />
          </CardContent>
        </Card>

        {/* Custom Text */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Text</CardTitle>
            <CardDescription>Use any text instead of FORMULA</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <FormulaLoader text="LOADING" size="md" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Name</CardTitle>
            <CardDescription>Brand with project or company name</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <FormulaLoader text="PMV3" size="md" />
          </CardContent>
        </Card>

        {/* Centered Loading */}
        <Card>
          <CardHeader>
            <CardTitle>Centered Loading</CardTitle>
            <CardDescription>Full loading state with description</CardDescription>
          </CardHeader>
          <CardContent>
            <FormulaLoading 
              text="Loading projects..."
              description="Fetching data from server"
              size="sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Interactive Demo */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>
            Click the button to simulate a loading state
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showLoading ? (
            <FormulaLoading 
              text="Processing request..."
              description="Please wait while we fetch your data"
              size="md"
            />
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">Click the button below to see the loader in action</p>
              <Button onClick={simulateLoading} size="lg">
                Simulate Loading
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inline Loader Examples */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Inline Loaders</CardTitle>
          <CardDescription>
            For use within content blocks or alongside other elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">Scope Items</span>
            <FormulaLoadingInline text="Loading" size="sm" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span className="font-medium">Project Data</span>
            <FormulaLoadingInline text="Syncing" size="sm" />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <span className="font-medium">Database Connection</span>
            <FormulaLoadingInline text="Connecting" size="sm" />
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            How to integrate these loaders into your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Basic Usage:</h4>
              <pre className="text-xs overflow-x-auto">
{`import { FormulaLoader } from '@/components/ui/formula-loader'

// Simple loader
<FormulaLoader size="md" />

// Custom text
<FormulaLoader text="LOADING" size="lg" />`}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Centered Loading State:</h4>
              <pre className="text-xs overflow-x-auto">
{`import { FormulaLoading } from '@/components/ui/formula-loader'

// For loading pages or sections
{isLoading && (
  <FormulaLoading 
    text="Loading projects..." 
    description="Fetching data from database"
  />
)}`}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Inline Usage:</h4>
              <pre className="text-xs overflow-x-auto">
{`import { FormulaLoadingInline } from '@/components/ui/formula-loader'

// For loading within existing content
<FormulaLoadingInline text="Processing" size="sm" />`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}