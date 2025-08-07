/**
 * Dashboard Layout with Parallel Routes
 * Optimized for sub-500ms navigation and simultaneous data loading
 */

import { Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardLayoutProps {
  children: React.ReactNode
  overview: React.ReactNode
  recent: React.ReactNode
  stats: React.ReactNode
}

function LoadingCard({ height = "h-32" }: { height?: string }) {
  return (
    <Card>
      <CardContent className={`${height} animate-pulse bg-muted/20`} />
    </Card>
  )
}

export default function DashboardLayout({
  children,
  overview,
  recent, 
  stats
}: DashboardLayoutProps) {
  return (
    <AppShell>
      <div className="flex-1 space-y-6 p-4 md:p-6 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        {/* Main dashboard content */}
        {children}
        
        {/* Parallel route: Overview metrics */}
        <div className="grid gap-4">
          <Suspense fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          }>
            {overview}
          </Suspense>
        </div>
        
        {/* Parallel routes: Recent activity and Stats */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingCard height="h-[400px]" />}>
              {stats}
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<LoadingCard height="h-[400px]" />}>
              {recent}
            </Suspense>
          </div>
        </div>
      </div>
    </AppShell>
  )
}