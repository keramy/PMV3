/**
 * Formula PM V3 Scope Management Page
 * Complete scope items management with Excel import/export
 */

import { Suspense } from 'react'
import { Metadata } from 'next/types'
import { ScopeManagementContainer } from '@/components/scope/ScopeManagementContainer'
import { ScopeLoading } from '@/components/ui/loading-states'

export const metadata: Metadata = {
  title: 'Scope Management | Formula PM V3',
  description: 'Manage project scope items with Excel import/export capabilities'
}

interface ScopePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ScopePage({ params, searchParams }: ScopePageProps) {
  const { id: projectId } = await params
  const filters = await searchParams

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Scope Management
          </h1>
          <p className="text-muted-foreground">
            Manage project scope items, assignments, and track progress
          </p>
        </div>
      </div>

      {/* Main Scope Management Interface */}
      <Suspense fallback={<ScopeLoading />}>
        <ScopeManagementContainer 
          projectId={projectId}
          initialFilters={filters}
        />
      </Suspense>
    </div>
  )
}