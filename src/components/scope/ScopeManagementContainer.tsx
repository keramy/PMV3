/**
 * Formula PM V3 Scope Management Container
 * Main container component for scope management with all features
 */

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermissions } from '@/hooks/usePermissions'
import { ScopeItemsList } from './ScopeItemsList'
import { ScopeTableExact } from './ScopeTableExact'
import { ScopeItemDialog } from './ScopeItemDialog'
import { ScopeExcelDialog } from './ScopeExcelDialog'
import { ScopeStatsCards } from './ScopeStatsCards'
import type { ScopeFilters, ScopeListResponse } from '@/types/scope'
import { SCOPE_CATEGORIES, SCOPE_STATUSES, SCOPE_PERMISSIONS } from '@/types/scope'
import {
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'

interface ScopeManagementContainerProps {
  projectId: string
  initialFilters?: { [key: string]: string | string[] | undefined }
}

export function ScopeManagementContainer({ 
  projectId, 
  initialFilters = {} 
}: ScopeManagementContainerProps) {
  const { hasPermission, hasAnyPermission } = usePermissions()
  
  // State
  const [filters, setFilters] = useState<ScopeFilters>({
    category: (initialFilters.category as any) || 'all',
    status: initialFilters.status ? (Array.isArray(initialFilters.status) ? initialFilters.status as any : [initialFilters.status]) : undefined,
    search_term: (initialFilters.search as string) || '',
  })
  
  const [activeTab, setActiveTab] = useState('list')
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [showExcelDialog, setShowExcelDialog] = useState(false)
  const [excelMode, setExcelMode] = useState<'import' | 'export'>('import')

  // Data fetching
  const { 
    data: scopeData, 
    isLoading, 
    error,
    refetch 
  } = useQuery<ScopeListResponse>({
    queryKey: ['scope-items', projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        project_id: projectId,
        page: '1',
        limit: '100',
      })

      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category)
      }
      if (filters.status && filters.status.length > 0) {
        params.append('status', filters.status.join(','))
      }
      if (filters.search_term) {
        params.append('search', filters.search_term)
      }

      const response = await fetch(`/api/scope?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch scope items')
      }
      const result = await response.json()
      return result.data
    }
  })

  // Handlers
  const handleFilterChange = (newFilters: Partial<ScopeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleExcelAction = (mode: 'import' | 'export') => {
    setExcelMode(mode)
    setShowExcelDialog(true)
  }

  const handleRefresh = () => {
    refetch()
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load scope items</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {scopeData?.statistics && (
        <ScopeStatsCards statistics={scopeData.statistics} />
      )}

      {/* Main Content */}
      <Card className="construction-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">Scope Items</CardTitle>
              {scopeData && (
                <Badge variant="secondary">
                  {scopeData.total_count} items
                </Badge>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {hasAnyPermission(SCOPE_PERMISSIONS.EXCEL_EXPORT) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExcelAction('import')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Excel
                </Button>
              )}

              {hasAnyPermission(SCOPE_PERMISSIONS.EXCEL_EXPORT) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExcelAction('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              )}

              {hasAnyPermission(SCOPE_PERMISSIONS.CREATE) && (
                <Button
                  size="sm"
                  onClick={() => setShowNewItemDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search scope items..."
                value={filters.search_term || ''}
                onChange={(e) => handleFilterChange({ search_term: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange({ category: value as any })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(SCOPE_CATEGORIES).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) => handleFilterChange({ 
                status: value === 'all' ? undefined : [value as any]
              })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(SCOPE_STATUSES).map(([key, status]) => (
                  <SelectItem key={key} value={key}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(filters.category !== 'all' || filters.status || filters.search_term) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ category: 'all' })}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <ScopeTableExact
                items={scopeData?.items || []}
                isLoading={isLoading}
                onItemUpdated={handleRefresh}
                projectId={projectId}
              />
            </TabsContent>

            <TabsContent value="kanban">
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <MoreHorizontal className="h-8 w-8 mx-auto mb-2" />
                  <p>Kanban view coming soon</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <MoreHorizontal className="h-8 w-8 mx-auto mb-2" />
                  <p>Timeline view coming soon</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showNewItemDialog && hasAnyPermission(SCOPE_PERMISSIONS.CREATE) && (
        <ScopeItemDialog
          isOpen={showNewItemDialog}
          onClose={() => setShowNewItemDialog(false)}
          onSaved={handleRefresh}
          projectId={projectId}
        />
      )}

      {showExcelDialog && hasAnyPermission(SCOPE_PERMISSIONS.EXCEL_EXPORT) && (
        <ScopeExcelDialog
          isOpen={showExcelDialog}
          onClose={() => setShowExcelDialog(false)}
          onComplete={handleRefresh}
          projectId={projectId}
          mode={excelMode}
        />
      )}
    </div>
  )
}