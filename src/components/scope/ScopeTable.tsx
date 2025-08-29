'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/providers/AuthProvider'
import { usePermissions } from '@/hooks/usePermissions'
import { toast } from '@/hooks/use-toast'
import { useCreateScopeItem } from '@/hooks/useScope'
import { EmptyScope, EmptyState } from '@/components/ui/empty-state'
import { FormulaLoading } from '@/components/ui/formula-loader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CostVarianceBadge, CostSummaryCard } from '@/components/ui/cost-variance-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ClipboardList,
  Search,
  Upload,
  Download,
  FileSpreadsheet,
  Link,
  Edit,
  Trash2,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  User,
  Filter,
  X,
  Check,
  Hammer,
  Zap,
  Wrench,
  Droplets,
  Wind,
  TreePine,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import type { ScopeCategory } from '@/types/scope'

// Scope Item interface matching actual database schema
interface ScopeItemWithSubcontractor {
  id: string
  project_id: string
  project_name?: string  // Optional project name for display
  scope_code?: string | null  // Scope identifier code
  title: string
  description: string | null
  category: string | null
  specification: string | null
  quantity: number | null
  unit: string | null
  unit_cost: number | null  // Sales price per unit
  total_cost: number | null  // Total sales revenue
  // Cost tracking fields
  initial_cost: number | null  // Initial estimated cost
  actual_cost: number | null   // Actual cost incurred
  cost_variance: number | null
  cost_variance_percentage: number | null
  // Relationships
  assigned_to: string | null
  assigned_user?: {
    id: string
    first_name: string | null
    last_name: string | null
    job_title: string | null
  }
  subcontractor_id: string | null
  subcontractor?: {
    id: string
    name: string
    trade: string | null
    contact_person: string | null
    phone: string | null
    email: string | null
  }
  // Metadata
  notes: string | null
  status: string | null
  priority: string | null
  start_date: string | null
  end_date: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface ScopeTableProps {
  projectId?: string
}

interface SubcontractorOption {
  id: string | null
  name: string
  trade: string
  contact_person: string
}

export function ScopeTable({ projectId }: ScopeTableProps) {
  // Comprehensive permissions hook for cost visibility
  const { canViewCosts, canEditCosts, isAdmin, filterCosts } = usePermissions()
  
  const [selectedProject, setSelectedProject] = useState(projectId || 'all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandAll, setExpandAll] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcontractors, setSelectedSubcontractors] = useState<string[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSubcontractorDropdown, setShowSubcontractorDropdown] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalPages, setTotalPages] = useState(0)
  
  // Modal state management
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ScopeItemWithSubcontractor | null>(null)
  
  // Add scope item form state
  const [newScopeItem, setNewScopeItem] = useState({
    title: '',
    description: '',
    category: '',
    specification: '',
    quantity: 1,
    unit: 'pcs' as const,
    unit_cost: 0,
    total_cost: 0,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'not_started',
    assigned_to: '',
    subcontractor_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  })

  const { profile } = useAuthContext()
  
  // Mutation hooks for API operations
  const createScopeItem = useCreateScopeItem()

  // Update selected project when projectId prop changes
  React.useEffect(() => {
    if (projectId && projectId !== selectedProject) {
      setSelectedProject(projectId)
    }
  }, [projectId, selectedProject])

  // Auto-calculate total cost when quantity or unit cost changes
  React.useEffect(() => {
    const totalCost = newScopeItem.quantity * newScopeItem.unit_cost
    if (totalCost !== newScopeItem.total_cost) {
      setNewScopeItem(prev => ({ ...prev, total_cost: totalCost }))
    }
  }, [newScopeItem.quantity, newScopeItem.unit_cost, newScopeItem.total_cost])

  // API integration with real data fetching
  const { data: scopeData, isLoading, error } = useQuery({
    queryKey: ['scope-items', {
      project_id: selectedProject === 'all' ? null : selectedProject,
      search: searchTerm,
      categories: selectedCategories,
      subcontractors: selectedSubcontractors,
      page: currentPage,
      limit: itemsPerPage
    }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedProject !== 'all') params.set('project_id', selectedProject)
      if (searchTerm) params.set('search', searchTerm)
      if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','))
      if (selectedSubcontractors.length > 0) params.set('assigned_to', selectedSubcontractors.join(','))
      params.set('page', currentPage.toString())
      params.set('limit', itemsPerPage.toString())
      
      const response = await fetch(`/api/scope?${params}`, {
        credentials: 'include' // Include session cookies for authentication
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED')
        }
        if (response.status === 403) {
          throw new Error('FORBIDDEN')
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch scope items`)
      }
      
      return response.json()
    },
    enabled: !!profile?.id
  })

  // Use real API data - fix data structure access
  const scopeItems = scopeData?.data?.items || []

  const statistics = scopeData?.data?.statistics || {}
  
  useEffect(() => {
    if (scopeData?.pagination) {
      setTotalPages(scopeData.pagination.total_pages)
    }
  }, [scopeData])

  // Calculate pagination values early for hooks
  const filteredScopeItems = scopeItems.filter((item: ScopeItemWithSubcontractor) => {
    const matchesProject = selectedProject === 'all' || item.project_id === selectedProject
    const matchesSearch = !searchTerm || 
                         item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.specification && item.specification.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategories.length === 0 || (item.category && selectedCategories.includes(item.category))
    const matchesSubcontractor = selectedSubcontractors.length === 0 || (item.assigned_to && selectedSubcontractors.includes(item.assigned_to))
    
    return matchesProject && matchesSearch && matchesCategory && matchesSubcontractor
  })

  const totalFilteredItems = filteredScopeItems.length
  const calculatedTotalPages = Math.ceil(totalFilteredItems / itemsPerPage)

  // Update total pages when filters change - moved before early return
  React.useEffect(() => {
    setTotalPages(calculatedTotalPages)
    // Reset to page 1 if current page is beyond available pages
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1)
    }
  }, [calculatedTotalPages, currentPage])

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <FormulaLoading 
          text="Loading scope items..." 
          description="Fetching project data from database"
        />
      </div>
    )
  }

  // Show error state with proper handling
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage === 'UNAUTHORIZED') {
      return (
        <div className="p-6">
          <EmptyState
            icon={ClipboardList}
            title="Authentication Required"
            description="Please log in to access scope items."
            action={{
              label: "Go to Login",
              onClick: () => window.location.href = '/login'
            }}
          />
        </div>
      )
    }
    
    if (errorMessage === 'FORBIDDEN') {
      return (
        <div className="p-6">
          <EmptyState
            icon={ClipboardList}
            title="Access Denied"
            description="You don't have permission to view scope items. Contact your administrator."
          />
        </div>
      )
    }
    
    return (
      <div className="p-6">
        <EmptyState
          icon={ClipboardList}
          title="Error Loading Scope Items"
          description={`Failed to load scope items: ${errorMessage}`}
          action={{
            label: "Retry",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const toggleAllRows = () => {
    if (expandAll) {
      setExpandedRows(new Set())
      setExpandAll(false)
    } else {
      setExpandedRows(new Set(paginatedItems.map((item: ScopeItemWithSubcontractor) => item.id)))
      setExpandAll(true)
    }
  }

  const formatCurrency = (value: number) => {
    return `₺${value.toLocaleString('tr-TR')}`
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      construction: 'Construction',
      millwork: 'Millwork',
      electrical: 'Electrical',
      mechanical: 'Mechanical',
      plumbing: 'Plumbing',
      hvac: 'HVAC'
    }
    return labels[category] || category
  }

  // Enhanced category styling for construction industry
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      construction: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200',
      millwork: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
      electrical: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
      mechanical: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
      plumbing: 'bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200',
      hvac: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
    }
    return colors[category] || 'bg-gray-200 text-gray-800 border-gray-400 hover:bg-gray-400'
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      construction: <Hammer className="h-3 w-3" />,
      millwork: <TreePine className="h-3 w-3" />,
      electrical: <Zap className="h-3 w-3" />,
      mechanical: <Wrench className="h-3 w-3" />,
      plumbing: <Droplets className="h-3 w-3" />,
      hvac: <Wind className="h-3 w-3" />
    }
    return icons[category] || <Building2 className="h-3 w-3" />
  }

  // Cost-based priority styling
  const getCostPriority = (cost: number) => {
    if (cost >= 50000) return 'cost-high' // High-value items
    if (cost >= 20000) return 'cost-medium' // Medium-value items
    return 'cost-standard' // Standard items
  }

  const getRowAccentColor = (category: string) => {
    const accents: Record<string, string> = {
      construction: 'border-l-4 border-l-orange-400',
      millwork: 'border-l-4 border-l-amber-400',
      electrical: 'border-l-4 border-l-yellow-400',
      mechanical: 'border-l-4 border-l-blue-400',
      plumbing: 'border-l-4 border-l-teal-400',
      hvac: 'border-l-4 border-l-purple-400'
    }
    return accents[category] || 'border-l-4 border-l-gray-400'
  }

  // Budget status styling for cost tracking
  const getBudgetStatus = (variance: number) => {
    if (variance > 0) return 'over_budget'
    if (variance < 0) return 'under_budget'
    return 'on_budget'
  }

  const getBudgetStatusColor = (variance: number) => {
    const status = getBudgetStatus(variance)
    const colors: Record<string, string> = {
      over_budget: 'bg-red-50 text-red-700 border-red-200',
      under_budget: 'bg-green-50 text-green-700 border-green-200',
      on_budget: 'bg-blue-50 text-blue-700 border-blue-200'
    }
    return colors[status]
  }

  const getBudgetStatusIcon = (variance: number) => {
    const status = getBudgetStatus(variance)
    if (status === 'over_budget') return '📈'
    if (status === 'under_budget') return '📉'
    return '✅'
  }

  // Profit calculation using correct database fields
  const calculateProfit = (totalCost: number, actualCost: number) => {
    return totalCost - actualCost
  }

  const calculateProfitPercentage = (totalCost: number, actualCost: number) => {
    if (totalCost === 0) return 0
    return ((totalCost - actualCost) / totalCost) * 100
  }

  // Profit margin analysis for PM-focused view
  const getProfitHealth = (profitPercentage: number) => {
    if (profitPercentage >= 15) return 'healthy'
    if (profitPercentage >= 5) return 'acceptable'
    return 'thin'
  }

  const getProfitHealthColor = (profitPercentage: number) => {
    const health = getProfitHealth(profitPercentage)
    const colors: Record<string, string> = {
      healthy: 'bg-green-50 text-green-700 border-green-200',
      acceptable: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
      thin: 'bg-red-50 text-red-700 border-red-200'
    }
    return colors[health]
  }

  const getProfitHealthIcon = (profitPercentage: number) => {
    const health = getProfitHealth(profitPercentage)
    if (health === 'healthy') return '💰'
    if (health === 'acceptable') return '⚖️'
    return '⚠️'
  }

  // Get unique values for filters
  const uniqueProjects = Array.from(
    new Map(scopeItems.map((item: ScopeItemWithSubcontractor) => [item.project_id, { id: item.project_id, name: item.project_name }])).values()
  )
  
  const uniqueCategories = Array.from(new Set(scopeItems.map((item: ScopeItemWithSubcontractor) => item.category).filter((category: string | null): category is string => category !== null))) as string[]
  const subcontractorMap = new Map(scopeItems.map((item: ScopeItemWithSubcontractor) => [item.assigned_to, { 
    id: item.assigned_to, 
    name: item.subcontractor?.name || 'Unassigned',
    trade: item.subcontractor?.trade || '',
    contact_person: item.subcontractor?.contact_person || '' 
  } as SubcontractorOption]))
  const uniqueSubcontractors = Array.from(subcontractorMap.values()) as SubcontractorOption[]

  // Clear all filters
  const clearFilters = () => {
    setSelectedProject('all')
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedSubcontractors([])
  }
  
  const hasActiveFilters = selectedProject !== 'all' || searchTerm || selectedCategories.length > 0 || selectedSubcontractors.length > 0
  
  // Calculate pagination (using values calculated earlier)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredScopeItems.slice(startIndex, endIndex)
  
  // Page navigation functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPrevPage = () => goToPage(currentPage - 1)
  
  // Modal action handlers
  const handleView = (item: ScopeItemWithSubcontractor) => {
    setSelectedItem(item)
    setViewModalOpen(true)
  }
  
  const handleEdit = (item: ScopeItemWithSubcontractor) => {
    setSelectedItem(item)
    setEditModalOpen(true)
  }
  
  const handleDelete = (item: ScopeItemWithSubcontractor) => {
    setSelectedItem(item)
    setDeleteModalOpen(true)
  }
  
  const handleSaveEdit = (updatedItem: ScopeItemWithSubcontractor) => {
    // TODO: Implement API call to save changes
    console.log('Saving changes:', updatedItem)
    setEditModalOpen(false)
    setSelectedItem(null)
  }
  
  const handleConfirmDelete = () => {
    if (selectedItem) {
      // TODO: Implement API call to delete item
      console.log('Deleting item:', selectedItem.id)
      setDeleteModalOpen(false)
      setSelectedItem(null)
    }
  }
  
  // Add scope item handlers
  const handleAddScopeItem = () => {
    setAddModalOpen(true)
  }
  
  const resetScopeItemForm = () => {
    setNewScopeItem({
      title: '',
      description: '',
      category: 'construction',
      specification: '',
      quantity: 1,
      unit: 'pcs' as const,
      unit_cost: 0,
      total_cost: 0,
      priority: 'medium' as const,
      status: 'not_started',
      assigned_to: 'unassigned',
      subcontractor_id: '',
      start_date: '',
      end_date: '',
      notes: ''
    })
  }
  
  const handleSaveNewScopeItem = async () => {
    try {
      const projectIdToUse = selectedProject !== 'all' ? selectedProject : projectId || ''
      
      if (!projectIdToUse) {
        throw new Error('Project ID is required')
      }
      
      const newItem = await createScopeItem.mutateAsync({
        project_id: projectIdToUse,
        title: newScopeItem.title,
        description: newScopeItem.description,
        category: newScopeItem.category as ScopeCategory | undefined,
        specification: newScopeItem.specification,
        quantity: newScopeItem.quantity,
        unit: newScopeItem.unit,
        unit_cost: newScopeItem.unit_cost,
        priority: newScopeItem.priority,
        status: newScopeItem.status,
        assigned_to: newScopeItem.assigned_to === 'unassigned' ? undefined : newScopeItem.assigned_to,
        subcontractor_id: newScopeItem.subcontractor_id || undefined,
        start_date: newScopeItem.start_date || undefined,
        end_date: newScopeItem.end_date || undefined,
        notes: newScopeItem.notes
      })
      
      // Show success notification
      toast({
        title: "Success!",
        description: `Scope item "${newScopeItem.title}" has been created successfully.`,
        variant: "default",
      })
      
      setAddModalOpen(false)
      resetScopeItemForm()
    } catch (error) {
      console.error('Failed to create scope item:', error)
      
      // Show error notification
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create scope item. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-white p-6 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            Scope Management
            {totalPages > 1 && (
              <span className="text-sm font-normal text-gray-700 bg-gray-200 px-2 py-1 rounded">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-800 mt-1">
            Project scope items and deliverables
            {totalPages > 1 && (
              <span className="text-gray-700"> • {totalFilteredItems} total items</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={toggleAllRows} className="hover:bg-gray-200 transition-colors">
            <ChevronsUpDown className="mr-2 h-4 w-4" />
            {expandAll ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button variant="outline" className="hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button 
            onClick={handleAddScopeItem}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Add Scope Item
          </Button>
        </div>
      </div>

      {/* Simplified Filters - Mobile-First Design */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col gap-6">
          {/* Primary Filters Row - Streamlined */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search - Most Important First */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
              <Input
                placeholder="Search scope items..."
                className="pl-12 h-12 text-base border-2 border-gray-400 focus:border-blue-500 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Simplified Filter Buttons */}
            <div className="flex gap-3">
              {/* Category Filter - Simplified */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 min-w-[140px] justify-between border-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="font-medium">Category</span>
                      {selectedCategories.length > 0 && (
                        <Badge variant="default" className="ml-1 bg-blue-600">
                          {selectedCategories.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-4">
                  <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pb-3 border-b">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-sm font-medium hover:bg-blue-50"
                        onClick={() => setSelectedCategories(uniqueCategories)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Select All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-sm font-medium hover:bg-red-50"
                        onClick={() => setSelectedCategories([])}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                    
                    {/* Categories Grid - Better Touch Targets */}
                    <div className="grid grid-cols-2 gap-2">
                      {uniqueCategories.map((category) => (
                        <div key={category} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category])
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category))
                              }
                            }}
                            className="h-5 w-5"
                          />
                          <label htmlFor={`category-${category}`} className="text-sm cursor-pointer font-medium select-none flex-1">
                            {getCategoryLabel(category)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Subcontractor Filter - Simplified */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 min-w-[160px] justify-between border-2 hover:bg-green-50 hover:border-green-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Assigned To</span>
                      {selectedSubcontractors.length > 0 && (
                        <Badge variant="default" className="ml-1 bg-green-600">
                          {selectedSubcontractors.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4">
                  <div className="space-y-3">
                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pb-3 border-b">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-sm font-medium hover:bg-green-50"
                        onClick={() => setSelectedSubcontractors(uniqueSubcontractors.map(s => s.id).filter((id): id is string => id !== null))}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Select All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-sm font-medium hover:bg-red-50"
                        onClick={() => setSelectedSubcontractors([])}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                    
                    {/* Subcontractors List - Better Mobile UX */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {uniqueSubcontractors.map((subcontractor) => (
                        <div key={subcontractor.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <Checkbox
                            id={`subcontractor-${subcontractor.id}`}
                            checked={subcontractor.id ? selectedSubcontractors.includes(subcontractor.id) : false}
                            onCheckedChange={(checked) => {
                              if (checked && subcontractor.id) {
                                setSelectedSubcontractors([...selectedSubcontractors, subcontractor.id])
                              } else {
                                setSelectedSubcontractors(selectedSubcontractors.filter(s => s !== subcontractor.id))
                              }
                            }}
                            className="h-5 w-5 mt-1"
                          />
                          <label htmlFor={`subcontractor-${subcontractor.id}`} className="text-sm cursor-pointer flex-1 select-none">
                            <div className="font-semibold text-gray-900">{subcontractor.name}</div>
                            <div className="text-xs text-gray-700 mt-1 capitalize">
                              {subcontractor.trade} • {subcontractor.contact_person}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters - More Prominent When Active */}
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="default" 
                  onClick={clearFilters} 
                  className="h-12 px-6 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 font-medium"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Simplified Statistics & Active Filters - Mobile-Responsive */}
          <div className="bg-gradient-to-r from-blue-50/50 to-transparent rounded-xl border p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Key Statistics - Condensed for Mobile */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">
                    <span className="text-blue-600 text-lg font-bold">{totalFilteredItems}</span> Items
                  </span>
                </div>
                
                {/* Essential Financial Metrics - Prioritized (Role-Based Visibility) */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-800">Total Items:</span>
                    <span className="text-blue-700 font-bold text-base">{filteredScopeItems.length}</span>
                  </span>
                  
                  {canViewCosts && (
                    <>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-800">Revenue:</span>
                        <span className="text-blue-700 font-bold text-base">
                          {formatCurrency(filteredScopeItems.reduce((sum: number, item: ScopeItemWithSubcontractor) => sum + (item.total_cost || 0), 0))}
                        </span>
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <span className="text-gray-800">Profit:</span>
                        <span className={`font-bold text-base ${
                          filteredScopeItems.reduce((sum: number, item: ScopeItemWithSubcontractor) => sum + calculateProfit(item.total_cost || 0, item.actual_cost || 0), 0) >= 0 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {formatCurrency(filteredScopeItems.reduce((sum: number, item: ScopeItemWithSubcontractor) => sum + calculateProfit(item.total_cost || 0, item.actual_cost || 0), 0))}
                        </span>
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <span className="text-gray-800">Margin:</span>
                        <span className="text-purple-700 font-bold text-base">
                          {filteredScopeItems.length > 0 
                            ? (filteredScopeItems.reduce((sum: number, item: ScopeItemWithSubcontractor) => sum + calculateProfitPercentage(item.total_cost || 0, item.actual_cost || 0), 0) / filteredScopeItems.length).toFixed(1)
                            : '0.0'
                          }%
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Active Filter Badges - Touch-Friendly */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(category => (
                    <Badge key={category} variant="outline" className="text-sm px-3 py-1 bg-blue-50 border-blue-200 text-blue-700">
                      {getCategoryLabel(category)}
                      <X 
                        className="ml-2 h-4 w-4 cursor-pointer hover:bg-blue-200 rounded-full p-0.5 transition-colors" 
                        onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                      />
                    </Badge>
                  ))}
                  {selectedSubcontractors.map(subcontractorId => (
                    <Badge key={subcontractorId} variant="outline" className="text-sm px-3 py-1 bg-green-50 border-green-200 text-green-700">
                      {uniqueSubcontractors.find(s => s.id === subcontractorId)?.name}
                      <X 
                        className="ml-2 h-4 w-4 cursor-pointer hover:bg-green-200 rounded-full p-0.5 transition-colors" 
                        onClick={() => setSelectedSubcontractors(selectedSubcontractors.filter(s => s !== subcontractorId))}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table - Mobile-First with Better Touch Targets */}
      <div className="rounded-xl border shadow-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-100 to-white border-b-2 border-gray-400">
              <TableHead className="w-16 py-4"></TableHead>
              <TableHead className="w-24 font-bold text-gray-800 py-4">ID</TableHead>
              <TableHead className="w-28 font-bold text-gray-800 py-4">Category</TableHead>
              <TableHead className="font-bold text-gray-800 py-4">Title</TableHead>
              <TableHead className="text-center font-bold text-gray-800 w-20 py-4">Qty</TableHead>
              <TableHead className="w-20 font-bold text-gray-800 py-4">Unit</TableHead>
              {canViewCosts && (
                <>
                  <TableHead className="text-right font-bold text-gray-800 w-28 py-4">Unit Price</TableHead>
                  <TableHead className="text-right font-bold text-gray-800 w-32 py-4">Total Price</TableHead>
                  <TableHead className="text-right font-bold text-gray-800 w-28 py-4">Budgeted</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 w-32 py-4">Variance</TableHead>
                </>
              )}
              <TableHead className="w-16 font-bold text-gray-800 py-4">Assigned</TableHead>
              <TableHead className="text-center font-bold text-gray-800 w-16 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item: ScopeItemWithSubcontractor) => {
              const isExpanded = expandedRows.has(item.id)
              return (
                <React.Fragment key={item.id}>
                  <TableRow 
                    className={`group hover:bg-gray-100/80 transition-all duration-200 ${getRowAccentColor(item.category || 'default')} ${getCostPriority(item.total_cost || 0) === 'cost-high' ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''} ${isExpanded ? 'bg-blue-50/40' : ''} cursor-pointer`}
                    onClick={() => toggleRow(item.id)}
                  >
                    <TableCell className="py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 hover:bg-blue-100 rounded-full transition-all duration-200"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-blue-600 transform transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-700 transform transition-transform duration-200 group-hover:text-blue-600" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-sm py-4 font-medium text-gray-800">
                      {item.scope_code || item.id?.slice(0, 8)}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        className={`${getCategoryColor(item.category || 'default')} font-semibold transition-colors border text-sm px-3 py-2`}
                      >
                        {getCategoryIcon(item.category || 'default')}
                        <span className="ml-1">{getCategoryLabel(item.category || 'default')}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold py-4 text-gray-900">{item.title}</TableCell>
                    <TableCell className="text-center font-bold py-4 text-base">{item.quantity}</TableCell>
                    <TableCell className="text-sm py-4 font-medium text-gray-800">{item.unit}</TableCell>
                    {canViewCosts && (
                      <>
                        <TableCell className="text-right py-4 font-mono text-base font-medium text-gray-800">
                          {formatCurrency(item.unit_cost || 0)}
                        </TableCell>
                        <TableCell className="text-right py-4 font-mono text-lg font-bold text-blue-700">
                          {formatCurrency(item.total_cost || 0)}
                        </TableCell>
                        <TableCell className="text-right py-4 font-mono text-base font-medium text-gray-800">
                          {formatCurrency(item.initial_cost || 0)}
                        </TableCell>
                        <TableCell className="text-center py-4">
                          <CostVarianceBadge 
                            initialCost={item.initial_cost}
                            actualCost={item.actual_cost}
                            costVariance={item.cost_variance}
                            costVariancePercentage={item.cost_variance_percentage}
                          />
                        </TableCell>
                      </>
                    )}
                    <TableCell className="py-4">
                      <div className="flex justify-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${getCategoryColor(item.category || 'default').split(' ')[0]} ${getCategoryColor(item.category || 'default').split(' ')[1]} cursor-pointer shadow-sm hover:shadow-md transition-shadow`} 
                             title={`${item.subcontractor?.name || 'Unassigned'}\n${item.subcontractor?.trade || ''}\n${item.subcontractor?.contact_person || ''}\n${item.subcontractor?.phone || ''}`}>
                          {(item.subcontractor?.name || 'UN').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full hover:bg-gray-200 hover:border-gray-400 transition-colors">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-2">
                            <DropdownMenuItem 
                              className="flex items-center gap-3 hover:bg-blue-50 cursor-pointer p-3 rounded-lg"
                              onClick={() => handleView(item as any)}
                            >
                              <Eye className="h-5 w-5 text-blue-600" />
                              <span className="font-medium">View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-3 hover:bg-emerald-50 cursor-pointer p-3 rounded-lg"
                              onClick={() => handleEdit(item as any)}
                            >
                              <Edit className="h-5 w-5 text-emerald-600" />
                              <span className="font-medium">Edit Item</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-3 hover:bg-red-50 text-red-600 cursor-pointer p-3 rounded-lg"
                              onClick={() => handleDelete(item as any)}
                            >
                              <Trash2 className="h-5 w-5" />
                              <span className="font-medium">Delete Item</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={10} className={`bg-gray-100 py-4 ${getRowAccentColor(item.category || 'default')}`}>
                        <div className="flex flex-col lg:flex-row gap-4 px-4">
                          {/* Main Details Section (60%) */}
                          <div className="flex-1 lg:flex-[3] space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">{item.description}</p>
                              <p className="text-sm text-gray-800">{item.specification}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-700">
                              <span>Project: {item.project_name}</span>
                              {item.notes && (
                                <span className="flex items-center gap-1">
                                  <span>📋</span> Has notes
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Profit Analysis Section (30%) - Role-Based Visibility */}
                          {canViewCosts && (
                            <div className="flex-1 lg:flex-[2]">
                              <div className="bg-white rounded-lg p-3 border-l-4 border-l-green-500 border border-gray-200">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-gray-800">
                                    <span>Sales:</span>
                                    <span className="font-medium">{formatCurrency(item.total_cost || 0)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-800">
                                    <span>Cost:</span>
                                    <span className="font-medium">{formatCurrency(item.actual_cost || 0)}</span>
                                  </div>
                                  <div className="border-t pt-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium">Profit:</span>
                                      <div className="text-right">
                                        <div className="font-bold text-green-700">
                                          {formatCurrency(calculateProfit(item.total_cost || 0, item.actual_cost || 0))}
                                        </div>
                                        <div className="text-lg font-bold text-green-700">
                                          {calculateProfitPercentage(item.total_cost || 0, item.actual_cost || 0).toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center pt-1">
                                    <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 border-green-200 font-medium flex items-center gap-1">
                                      💰 Profit Analysis
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Spacer for layout when costs are hidden */}
                          {!canViewCosts && <div className="flex-1 lg:flex-[2]" />}

                          {/* Quick Actions Section (10%) */}
                          <div className="flex lg:flex-col gap-2 lg:flex-[1]">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-8"
                              onClick={() => handleView(item as any)}
                            >
                              View Details
                            </Button>
                            <div className="text-xs text-gray-700 lg:mt-2">
                              {new Date(item.created_at || new Date()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {paginatedItems.length === 0 && (
        <div className="py-8">
          <EmptyScope onCreateScope={() => {
            // TODO: Open create scope modal
            console.log('Create scope item')
          }} />
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && paginatedItems.length > 0 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-t">
          {/* Items info */}
          <div className="flex items-center gap-4 text-sm text-gray-800">
            <span>
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, totalFilteredItems)}</span> of{' '}
              <span className="font-medium">{totalFilteredItems}</span> items
            </span>
            
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1) // Reset to first page when changing page size
              }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
          </div>
          
          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* First page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            {/* Previous page */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {/* Show page numbers with smart truncation */}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNumber: number
                
                if (totalPages <= 7) {
                  // Show all pages if total is 7 or less
                  pageNumber = i + 1
                } else if (currentPage <= 4) {
                  // Show first 5 pages + ... + last page
                  if (i < 5) pageNumber = i + 1
                  else if (i === 5) return <span key="ellipsis1" className="px-2 text-gray-600">...</span>
                  else pageNumber = totalPages
                } else if (currentPage >= totalPages - 3) {
                  // Show first page + ... + last 5 pages
                  if (i === 0) pageNumber = 1
                  else if (i === 1) return <span key="ellipsis2" className="px-2 text-gray-600">...</span>
                  else pageNumber = totalPages - (6 - i)
                } else {
                  // Show first page + ... + current-1, current, current+1 + ... + last page
                  if (i === 0) pageNumber = 1
                  else if (i === 1) return <span key="ellipsis3" className="px-2 text-gray-600">...</span>
                  else if (i >= 2 && i <= 4) pageNumber = currentPage + (i - 3)
                  else if (i === 5) return <span key="ellipsis4" className="px-2 text-gray-600">...</span>
                  else pageNumber = totalPages
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNumber)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            
            {/* Next page */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Last page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Add Scope Item Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Scope Item</DialogTitle>
            <DialogDescription>
              Create a new scope item for the project. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Title *
                  </label>
                  <Input
                    value={newScopeItem.title}
                    onChange={(e) => setNewScopeItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Install kitchen cabinets"
                    className="border-gray-400 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newScopeItem.description}
                    onChange={(e) => setNewScopeItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the scope item..."
                    className="w-full h-20 px-3 py-2 border border-gray-400 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Category
                  </label>
                  <Select 
                    value={newScopeItem.category} 
                    onValueChange={(value) => setNewScopeItem(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="border-gray-400 focus:border-blue-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="millwork">Millwork</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Priority
                  </label>
                  <Select 
                    value={newScopeItem.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                      setNewScopeItem(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="border-gray-400 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Specification
                </label>
                <Input
                  value={newScopeItem.specification}
                  onChange={(e) => setNewScopeItem(prev => ({ ...prev, specification: e.target.value }))}
                  placeholder="Technical specifications or requirements"
                  className="border-gray-400 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Quantity and Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Quantity & Pricing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    value={newScopeItem.quantity}
                    onChange={(e) => setNewScopeItem(prev => ({ 
                      ...prev, 
                      quantity: parseFloat(e.target.value) || 0 
                    }))}
                    min="0"
                    step="0.01"
                    className="border-gray-400 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Unit
                  </label>
                  <Select 
                    value={newScopeItem.unit} 
                    onValueChange={(value: any) => setNewScopeItem(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger className="border-gray-400 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="set">Set</SelectItem>
                      <SelectItem value="lm">Linear Meter</SelectItem>
                      <SelectItem value="sqm">Square Meter</SelectItem>
                      <SelectItem value="cum">Cubic Meter</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="lot">Lot</SelectItem>
                      <SelectItem value="ea">Each</SelectItem>
                      <SelectItem value="sf">Square Feet</SelectItem>
                      <SelectItem value="lf">Linear Feet</SelectItem>
                      <SelectItem value="cf">Cubic Feet</SelectItem>
                      <SelectItem value="hrs">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {canEditCosts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Unit Cost (₺)
                    </label>
                    <Input
                      type="number"
                      value={newScopeItem.unit_cost}
                      onChange={(e) => setNewScopeItem(prev => ({ 
                        ...prev, 
                        unit_cost: parseFloat(e.target.value) || 0 
                      }))}
                      min="0"
                      step="0.01"
                      className="border-gray-400 focus:border-blue-500"
                    />
                  </div>
                )}
                
                {canEditCosts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Total Cost (₺)
                    </label>
                    <Input
                      type="number"
                      value={newScopeItem.total_cost}
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-700 font-semibold"
                    />
                    <p className="text-xs text-gray-600 mt-1">Auto-calculated</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Assignment and Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Assignment & Schedule
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Assigned To
                  </label>
                  <Select 
                    value={newScopeItem.assigned_to || 'unassigned'} 
                    onValueChange={(value) => setNewScopeItem(prev => ({ 
                      ...prev, 
                      assigned_to: value 
                    }))}
                  >
                    <SelectTrigger className="border-gray-400 focus:border-blue-500">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {uniqueSubcontractors
                        .filter(sub => sub.id !== null && sub.id !== '')
                        .map((sub) => (
                          <SelectItem key={sub.id} value={sub.id!}>
                            {sub.name} - {sub.trade}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Status
                  </label>
                  <Select 
                    value={newScopeItem.status} 
                    onValueChange={(value) => setNewScopeItem(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="border-gray-400 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={newScopeItem.start_date}
                    onChange={(e) => setNewScopeItem(prev => ({ ...prev, start_date: e.target.value }))}
                    className="border-gray-400 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={newScopeItem.end_date}
                    onChange={(e) => setNewScopeItem(prev => ({ ...prev, end_date: e.target.value }))}
                    className="border-gray-400 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              <div>
                <textarea
                  value={newScopeItem.notes}
                  onChange={(e) => setNewScopeItem(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes, requirements, or comments..."
                  className="w-full h-24 px-3 py-2 border border-gray-400 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setAddModalOpen(false)
                resetScopeItemForm()
              }}
              className="border-gray-400 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveNewScopeItem}
              disabled={!newScopeItem.title || createScopeItem.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createScopeItem.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Create Scope Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modals for view, edit, delete would be here */}
    </div>
  )
}