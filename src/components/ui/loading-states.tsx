/**
 * Construction-Optimized Loading States
 * Designed for construction workflows with mobile-first approach
 * Provides visual feedback for various construction data types
 */

'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Building2, 
  FileImage, 
  ListTodo, 
  Package, 
  Users, 
  Calendar,
  Layers,
  FileText,
  AlertTriangle,
  BarChart3
} from 'lucide-react'

// Base skeleton component optimized for construction UI
export function ConstructionSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton 
      className={cn('bg-muted/20 animate-pulse', className)} 
      {...props} 
    />
  )
}

// Project overview loading state
export function ProjectOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Project header skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ConstructionSkeleton className="h-8 w-8 rounded" />
            <ConstructionSkeleton className="h-8 w-64" />
          </div>
          <ConstructionSkeleton className="h-8 w-24 rounded-full" />
        </div>
        <ConstructionSkeleton className="h-4 w-48" />
      </div>
      
      {/* Stats cards skeleton */}
      <div className="construction-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="construction-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <ConstructionSkeleton className="h-4 w-20" />
                <ConstructionSkeleton className="h-5 w-5 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <ConstructionSkeleton className="h-8 w-16 mb-2" />
              <ConstructionSkeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Progress chart skeleton */}
      <Card>
        <CardHeader>
          <ConstructionSkeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <ConstructionSkeleton className="h-64 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}

// Scope items loading state
export function ScopeItemsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <ConstructionSkeleton className="h-10 flex-1" />
        <ConstructionSkeleton className="h-10 w-32" />
        <ConstructionSkeleton className="h-10 w-28" />
      </div>
      
      {/* Scope items list */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="construction-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <ConstructionSkeleton className="h-4 w-16" />
                    <ConstructionSkeleton className="h-4 w-24 rounded-full" />
                    <ConstructionSkeleton className="h-4 w-20 rounded-full" />
                  </div>
                  <ConstructionSkeleton className="h-5 w-3/4" />
                  <ConstructionSkeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <ConstructionSkeleton className="h-8 w-20" />
                  <ConstructionSkeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Drawings loading state
export function DrawingsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex space-x-1">
        {['All', 'Pending', 'Approved', 'Rejected'].map((tab, i) => (
          <ConstructionSkeleton key={i} className="h-9 w-20" />
        ))}
      </div>
      
      {/* Drawings grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="construction-card">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Drawing thumbnail */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <FileImage className="h-8 w-8 text-muted-foreground" />
                </div>
                
                {/* Drawing info */}
                <div className="space-y-2">
                  <ConstructionSkeleton className="h-4 w-full" />
                  <ConstructionSkeleton className="h-3 w-2/3" />
                  <div className="flex justify-between">
                    <ConstructionSkeleton className="h-4 w-16 rounded-full" />
                    <ConstructionSkeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Tasks loading state
export function TasksSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Task filters */}
      <div className="flex flex-wrap gap-2">
        {['All Tasks', 'My Tasks', 'Overdue', 'High Priority'].map((filter, i) => (
          <ConstructionSkeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      
      {/* Tasks list */}
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="construction-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <ConstructionSkeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-1">
                    <ConstructionSkeleton className="h-4 w-3/4" />
                    <ConstructionSkeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ConstructionSkeleton className="h-6 w-6 rounded-full" />
                  <ConstructionSkeleton className="h-4 w-16 rounded-full" />
                  <ConstructionSkeleton className="h-3 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Timeline/Gantt loading state
export function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {/* Timeline controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <ConstructionSkeleton className="h-9 w-20" />
          <ConstructionSkeleton className="h-9 w-20" />
          <ConstructionSkeleton className="h-9 w-20" />
        </div>
        <ConstructionSkeleton className="h-9 w-32" />
      </div>
      
      {/* Gantt chart skeleton */}
      <Card>
        <CardContent className="p-0">
          {/* Timeline header */}
          <div className="border-b p-4">
            <ConstructionSkeleton className="h-6 w-48" />
          </div>
          
          {/* Timeline rows */}
          <div className="divide-y">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center p-4">
                <div className="w-64 pr-4">
                  <ConstructionSkeleton className="h-4 w-full mb-1" />
                  <ConstructionSkeleton className="h-3 w-2/3" />
                </div>
                <div className="flex-1 relative">
                  <ConstructionSkeleton 
                    className="h-6 absolute" 
                    style={{ 
                      left: `${Math.random() * 20}%`, 
                      width: `${20 + Math.random() * 40}%` 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// RFIs loading state
export function RFIsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* RFI stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Open', 'Pending', 'Answered', 'Closed'].map((status, i) => (
          <Card key={i} className="construction-card">
            <CardContent className="p-4 text-center">
              <ConstructionSkeleton className="h-8 w-12 mx-auto mb-2" />
              <ConstructionSkeleton className="h-3 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* RFI list */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="construction-card">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <ConstructionSkeleton className="h-5 w-32" />
                  <ConstructionSkeleton className="h-5 w-20 rounded-full" />
                </div>
                <ConstructionSkeleton className="h-4 w-full" />
                <ConstructionSkeleton className="h-4 w-3/4" />
                <div className="flex justify-between text-sm">
                  <ConstructionSkeleton className="h-3 w-24" />
                  <ConstructionSkeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Loading state with construction icon and message
interface ConstructionLoadingProps {
  icon?: React.ElementType
  message?: string
  description?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ConstructionLoading({ 
  icon: Icon = Building2, 
  message = "Loading construction data...", 
  description,
  className,
  size = 'md'
}: ConstructionLoadingProps) {
  const sizeClasses = {
    sm: 'p-8',
    md: 'p-12',
    lg: 'p-16'
  }
  
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  }
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size],
      className
    )}>
      <div className="relative mb-4">
        <Icon className={cn(
          iconSizes[size],
          'text-primary animate-pulse'
        )} />
        
        {/* Construction site animation effect */}
        <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
      </div>
      
      <h3 className={cn(
        'font-semibold text-foreground mb-2',
        {
          'text-lg': size === 'sm',
          'text-xl': size === 'md',
          'text-2xl': size === 'lg'
        }
      )}>
        {message}
      </h3>
      
      {description && (
        <p className={cn(
          'text-muted-foreground max-w-sm',
          {
            'text-sm': size === 'sm',
            'text-base': size === 'md',
            'text-lg': size === 'lg'
          }
        )}>
          {description}
        </p>
      )}
      
      {/* Progress indicator for mobile */}
      <div className="mt-4 w-32">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" 
               style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}

// Specific loading states for different construction features
export function ScopeLoading() {
  return (
    <ConstructionLoading 
      icon={Layers}
      message="Loading scope items..."
      description="Fetching project scope and subcontractor assignments"
    />
  )
}

export function DrawingsLoading() {
  return (
    <ConstructionLoading 
      icon={FileImage}
      message="Loading drawings..."
      description="Retrieving shop drawings and approval status"
    />
  )
}

export function TasksLoading() {
  return (
    <ConstructionLoading 
      icon={ListTodo}
      message="Loading tasks..."
      description="Gathering task assignments and progress updates"
    />
  )
}

export function MaterialsLoading() {
  return (
    <ConstructionLoading 
      icon={Package}
      message="Loading materials..."
      description="Fetching material specifications and approvals"
    />
  )
}

export function TeamLoading() {
  return (
    <ConstructionLoading 
      icon={Users}
      message="Loading team..."
      description="Getting team member assignments and availability"
    />
  )
}

export function ScheduleLoading() {
  return (
    <ConstructionLoading 
      icon={Calendar}
      message="Loading schedule..."
      description="Building project timeline and milestone data"
    />
  )
}

export function ReportsLoading() {
  return (
    <ConstructionLoading 
      icon={BarChart3}
      message="Generating reports..."
      description="Analyzing project data and creating visualizations"
    />
  )
}

// Error state for construction workflows
interface ConstructionErrorProps {
  error: Error
  onRetry?: () => void
  context?: string
  className?: string
}

export function ConstructionError({ 
  error, 
  onRetry, 
  context = "construction data",
  className 
}: ConstructionErrorProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-12',
      className
    )}>
      <div className="relative mb-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Failed to load {context}
      </h3>
      
      <p className="text-muted-foreground max-w-sm mb-4">
        {error.message || "An unexpected error occurred while loading the data."}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md mobile-touch-target hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
      
      <p className="text-xs text-muted-foreground mt-4">
        If this problem persists, contact your system administrator.
      </p>
    </div>
  )
}