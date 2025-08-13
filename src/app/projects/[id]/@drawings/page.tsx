/**
 * Formula PM V3 Shop Drawings Overview Page
 * Parallel route for project workspace - shop drawings section
 */

import { Suspense } from 'react'
import { ShopDrawingsContainer } from '@/components/shop-drawings/ShopDrawingsContainer'
import { ShopDrawingsListSkeleton } from '@/components/ui/loading-states'

interface ShopDrawingsOverviewPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ShopDrawingsOverviewPage({ 
  params,
  searchParams 
}: ShopDrawingsOverviewPageProps) {
  const { id: projectId } = await params
  const filters = await searchParams

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shop Drawings</h1>
          <p className="text-muted-foreground">
            Manage submittal drawings and approval workflow
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<ShopDrawingsListSkeleton count={5} />}>
        <ShopDrawingsOverviewContent 
          projectId={projectId}
          initialFilters={filters}
        />
      </Suspense>
    </div>
  )
}

// Content component with data loading
async function ShopDrawingsOverviewContent({ 
  projectId, 
  initialFilters 
}: {
  projectId: string
  initialFilters: any
}) {
  return (
    <ShopDrawingsContainer
      projectId={projectId}
      initialFilters={initialFilters}
    />
  )
}