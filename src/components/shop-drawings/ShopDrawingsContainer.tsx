/**
 * Formula PM V3 Shop Drawings Management Container
 * Main container component for shop drawings management with approval workflow
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
import { usePermissionsEnhanced } from '@/hooks/usePermissionsEnhanced'
import { ShopDrawingsList } from './ShopDrawingsList'
import { ShopDrawingUploadDialog } from './ShopDrawingUploadDialog'
import { ShopDrawingDetailDialog } from './ShopDrawingDetailDialog'
import { 
  SHOP_DRAWING_STATUSES, 
  DRAWING_CATEGORIES, 
  DRAWING_PRIORITIES,
  SHOP_DRAWING_PERMISSIONS,
  type ShopDrawingFilters,
  type ShopDrawing,
  type ShopDrawingListResponse 
} from '@/types/shop-drawings'
import {
  FileImage,
  Filter,
  Search,
  Upload,
  Download,
  RefreshCw,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface ShopDrawingsContainerProps {
  projectId: string
  initialFilters?: Partial<ShopDrawingFilters>
}

interface ShopDrawingFiltersState extends ShopDrawingFilters {
  search_term?: string
  page: number
  limit: number
  sort_field: string
  sort_direction: 'asc' | 'desc'
}

export function ShopDrawingsContainer({ 
  projectId, 
  initialFilters = {} 
}: ShopDrawingsContainerProps) {
  const { hasPermission, hasAnyPermission } = usePermissionsEnhanced()
  
  // State
  const [filters, setFilters] = useState<ShopDrawingFiltersState>({
    status: (initialFilters.status as any) || undefined,
    category: (initialFilters.category as any) || undefined,
    priority: (initialFilters.priority as any) || undefined,
    search_term: '',
    page: 1,
    limit: 20,
    sort_field: 'created_at',
    sort_direction: 'desc'
  })
  
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedDrawing, setSelectedDrawing] = useState<ShopDrawing | null>(null)
  
  // Data fetching
  const { 
    data: drawingsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['shop-drawings', projectId, filters],
    queryFn: async (): Promise<ShopDrawingListResponse> => {
      const params = new URLSearchParams({
        project_id: projectId,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sort_field: filters.sort_field,
        sort_direction: filters.sort_direction
      })
      
      // Add filters
      if (filters.status && filters.status.length > 0) {
        params.set('status', filters.status.join(','))
      }
      if (filters.category && filters.category !== 'all') {
        params.set('category', filters.category)
      }
      if (filters.priority && filters.priority !== 'all') {
        params.set('priority', filters.priority)
      }
      if (filters.search_term && filters.search_term.trim()) {
        params.set('search', filters.search_term.trim())
      }
      if (filters.submitted_by) {
        params.set('submitted_by', filters.submitted_by)
      }
      if (filters.client_contact) {
        params.set('client_contact', filters.client_contact)
      }
      if (filters.current_turn && filters.current_turn !== 'all') {
        params.set('current_turn', filters.current_turn)
      }

      const response = await fetch(`/api/shop-drawings?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch shop drawings')
      }
      
      const result = await response.json()
      return result.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  })

  // Event handlers
  const handleFilterChange = (key: keyof ShopDrawingFiltersState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleSearch = (searchTerm: string) => {
    handleFilterChange('search_term', searchTerm)
  }

  const handleDrawingUpdated = () => {
    refetch()
  }

  const handleDrawingClick = (drawing: ShopDrawing) => {
    setSelectedDrawing(drawing)
  }

  // Get statistics
  const stats = drawingsResponse?.statistics

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="construction-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileImage className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Drawings</p>
                <p className="text-2xl font-bold">{stats?.total_drawings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Client</p>
                <p className="text-2xl font-bold">
                  {stats?.by_turn?.client || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats?.by_status?.approved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="construction-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats?.metrics?.overdue || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="construction-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Shop Drawings</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {hasAnyPermission(SHOP_DRAWING_PERMISSIONS.CREATE) && (
                <Button
                  size="sm"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Drawing
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drawings..."
                value={filters.search_term || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select 
              value={filters.status?.[0] || 'all'} 
              onValueChange={(value) => 
                handleFilterChange('status', value === 'all' ? undefined : [value])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(SHOP_DRAWING_STATUSES).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`px-1 py-0 text-xs bg-${config.color}-100 text-${config.color}-800`}
                      />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => 
                handleFilterChange('category', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(DRAWING_CATEGORIES).map(([category, config]) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center space-x-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select 
              value={filters.priority || 'all'} 
              onValueChange={(value) => 
                handleFilterChange('priority', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(DRAWING_PRIORITIES).map(([priority, config]) => (
                  <SelectItem key={priority} value={priority}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-${config.color}-500`} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          {drawingsResponse && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {drawingsResponse.drawings.length} of {drawingsResponse.total_count} drawings
              </span>
              <span>
                {stats?.metrics?.avg_days_to_approval && 
                  `Avg approval: ${stats.metrics.avg_days_to_approval} days`
                }
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawings List */}
      <ShopDrawingsList 
        drawings={drawingsResponse?.drawings || []}
        isLoading={isLoading}
        onDrawingClick={handleDrawingClick}
        onDrawingUpdated={handleDrawingUpdated}
        projectId={projectId}
      />

      {/* Upload Dialog */}
      {showUploadDialog && (
        <ShopDrawingUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          projectId={projectId}
          onDrawingCreated={handleDrawingUpdated}
        />
      )}

      {/* Detail Dialog */}
      {selectedDrawing && (
        <ShopDrawingDetailDialog
          drawing={selectedDrawing}
          open={!!selectedDrawing}
          onOpenChange={(open) => !open && setSelectedDrawing(null)}
          onDrawingUpdated={handleDrawingUpdated}
        />
      )}
    </div>
  )
}