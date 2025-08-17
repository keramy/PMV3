'use client'

import React, { useState, useEffect } from 'react'
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

// Scope Item interface matching actual database schema
interface ScopeItemWithSubcontractor {
  id: string
  project_id: string
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
  // completion_percentage removed - not tracked for scope items
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

export function ScopeTable() {
  const [selectedProject, setSelectedProject] = useState('all')
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
  const [selectedItem, setSelectedItem] = useState<ScopeItemWithSubcontractor | null>(null)

  // TODO: Replace with real API integration
  /*
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
      
      const response = await fetch(`/api/scope?${params}`)
      if (!response.ok) throw new Error('Failed to fetch scope items')
      return response.json()
    }
  })

  const scopeItems = scopeData?.items || []
  const statistics = scopeData?.statistics || {}
  
  useEffect(() => {
    if (scopeData?.pagination) {
      setTotalPages(scopeData.pagination.totalPages)
    }
  }, [scopeData])

  if (isLoading) return <ScopeTableLoadingSkeleton />
  if (error) return <ErrorBoundary error={error} />
  */

  // Scope items data aligned with FUTURE database schema using subcontractors (MOCK DATA - REMOVE WHEN API CONNECTED)
  // Current DB: scope_items.assigned_to -> user_profiles (V2 pattern)
  // Future DB: scope_items.subcontractor_id -> subcontractors (V3 pattern)
  // Standardized field naming: subcontractor_contact_person (matches DB subcontractors.contact_person)
  // Ready for database migration to subcontractor-based assignments
  const scopeItems = [
    {
      id: 'SCOPE001',
      project_id: 'proj-001',
      title: 'Kitchen Upper Cabinets Installation',
      description: 'Premium maple finish installation for executive kitchen',
      category: 'millwork',
      specification: 'Soft-close hardware, maple finish, Grade A materials',
      quantity: 4,
      unit: 'EA',
      unit_cost: 450,
      total_cost: 1800,
      // Cost tracking - slightly over budget
      initial_cost: 1500,
      actual_cost: 1620,
      cost_variance: 120,
      cost_variance_percentage: 8.0,
      assigned_to: 'user-003',
      assigned_user: {
        id: 'user-003',
        first_name: 'John',
        last_name: 'Smith',
        job_title: 'Site Supervisor'
      },
      subcontractor_id: 'sub-001',
      subcontractor: {
        id: 'sub-001',
        name: 'Premium Woodworks LLC',
        trade: 'millwork',
        contact_person: 'John Smith',
        phone: '+1 555-0123',
        email: 'john@premiumwoodworks.com'
      },
      notes: 'Premium maple finish with soft-close hardware',
      status: 'in_progress',
      priority: 'high',
      start_date: '2024-01-15',
      end_date: '2024-02-15',
      created_by: 'user-002',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SCOPE002',
      project_id: 'proj-001',
      title: 'Kitchen Base Cabinets Installation',
      description: 'Base cabinet system with drawer organizers',
      category: 'millwork',
      specification: 'Soft-close drawers, maple finish matching uppers',
      quantity: 6,
      unit: 'EA',
      unit_cost: 380,
      total_cost: 2280,
      // Cost tracking - under budget
      initial_cost: 2280,
      actual_cost: 2150,
      cost_variance: -130,
      cost_variance_percentage: -5.70,
      subcontractor_id: 'sub-001',
      notes: 'Includes soft-close drawers and doors',
      created_by: 'user-002',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SCOPE003',
      project_id: 'proj-001',
      title: 'Reception Desk - Custom Build',
      description: 'Executive reception desk with integrated technology',
      category: 'millwork',
      specification: 'Custom design with cable management and LED lighting',
      quantity: 1,
      unit: 'EA',
      unit_cost: 2800,
      total_cost: 2800,
      // Cost tracking - on budget
      initial_cost: 2800,
      actual_cost: 2800,
      cost_variance: 0,
      cost_variance_percentage: 0,
      subcontractor_id: 'sub-002',
      subcontractor_name: 'Elite Custom Millwork',
      subcontractor_contact_person: 'Sarah Johnson',
      subcontractor_phone: '+1 555-0234',
      notes: 'Executive-level custom reception desk with cable management',
      created_by: 'user-002',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z'
    },
    {
      id: 'SCOPE004',
      project_id: 'proj-003',
      title: 'HVAC System Installation',
      description: 'VRF system installation for tower floors 15-20',
      category: 'hvac',
      specification: 'Variable Refrigerant Flow with BMS integration',
      quantity: 1,
      unit: 'LOT',
      unit_cost: 85000,
      total_cost: 85000,
      // Cost tracking - significantly over budget (high-value item)
      initial_cost: 85000,
      actual_cost: 92000,
      cost_variance: 7000,
      cost_variance_percentage: 8.24,
      subcontractor_id: 'sub-003',
      subcontractor_name: 'ProTech HVAC Systems',
      subcontractor_trade: 'hvac',
      subcontractor_contact_person: 'Mike Chen',
      subcontractor_phone: '+1 555-0345',
      notes: 'VRF system for floors 15-20 with BMS integration',
      created_by: 'user-002',
      created_at: '2024-01-05T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z'
    },
    {
      id: 'SCOPE005',
      project_id: 'proj-003',
      title: 'Structural Steel Frame',
      description: 'High-rise structural steel framework',
      category: 'construction',
      specification: 'Grade 50 steel, seismic zone 4 requirements',
      quantity: 250,
      unit: 'TONS',
      unit_cost: 720,
      total_cost: 180000,
      // Cost tracking - major savings (high-value item)
      initial_cost: 180000,
      actual_cost: 165000,
      cost_variance: -15000,
      cost_variance_percentage: -8.33,
      subcontractor_id: 'sub-004',
      subcontractor_name: 'Apex Steel Construction',
      subcontractor_trade: 'construction',
      subcontractor_contact_person: 'David Wilson',
      subcontractor_phone: '+1 555-0456',
      notes: 'Seismic-resistant steel frame for high-rise construction',
      created_by: 'user-002',
      created_at: '2024-01-03T10:00:00Z',
      updated_at: '2024-01-03T10:00:00Z'
    },
    {
      id: 'SCOPE006',
      project_id: 'proj-002',
      title: 'Server Room Cooling',
      description: 'Precision cooling system for data center',
      category: 'mechanical',
      specification: 'N+1 redundancy, 24/7 operation capability',
      quantity: 2,
      unit: 'UNITS',
      unit_cost: 22500,
      total_cost: 45000,
      // Cost tracking - slightly under budget
      initial_cost: 45000,
      actual_cost: 43500,
      cost_variance: -1500,
      cost_variance_percentage: -3.33,
      subcontractor_id: 'sub-003',
      subcontractor_name: 'ProTech HVAC Systems',
      subcontractor_trade: 'hvac',
      subcontractor_contact_person: 'Mike Chen',
      subcontractor_phone: '+1 555-0345',
      notes: 'Redundant precision cooling for data center',
      created_by: 'user-002',
      created_at: '2023-12-15T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z'
    },
    {
      id: 'SCOPE007',
      project_id: 'proj-002',
      title: 'Electrical Distribution',
      description: 'Main electrical distribution system',
      category: 'electrical',
      specification: '2000A main, UPS backup, generator connection',
      quantity: 1,
      unit: 'LOT',
      unit_cost: 35000,
      total_cost: 35000,
      // Cost tracking - on budget
      initial_cost: 35000,
      actual_cost: 35000,
      cost_variance: 0,
      cost_variance_percentage: 0,
      subcontractor_id: 'sub-005',
      subcontractor_name: 'PowerMax Electrical',
      subcontractor_trade: 'electrical',
      subcontractor_contact_person: 'Emily Brown',
      subcontractor_phone: '+1 555-0567',
      notes: 'Main electrical distribution with UPS backup systems',
      created_by: 'user-002',
      created_at: '2023-12-20T10:00:00Z',
      updated_at: '2024-01-22T10:00:00Z'
    },
    {
      id: 'SCOPE008',
      project_id: 'proj-004',
      project_name: 'Tech Hub Renovation Phase 2',
      title: 'Interior Fit-out Phase 2',
      description: 'Open office workspace renovation',
      category: 'construction',
      specification: 'Modern open plan with collaboration zones',
      quantity: 1200,
      unit: 'SF',
      unit_cost: 23.33,
      total_cost: 28000,
      // Cost tracking - over budget
      initial_cost: 28000,
      actual_cost: 30500,
      cost_variance: 2500,
      cost_variance_percentage: 8.93,
      subcontractor_id: 'sub-002',
      subcontractor_name: 'Elite Custom Millwork',
      subcontractor_contact_person: 'Sarah Johnson',
      subcontractor_phone: '+1 555-0234',
      notes: 'Open workspace design with modern tech integration',
      created_by: 'user-002',
      created_at: '2023-11-15T10:00:00Z',
      updated_at: '2024-01-05T10:00:00Z'
    },
    {
      id: 'SCOPE009',
      project_id: 'proj-006',
      project_name: 'Formula HQ Showroom',
      title: 'Showroom Display Systems',
      description: 'Interactive product display units',
      category: 'millwork',
      specification: 'Custom display cases with integrated LED and touch screens',
      quantity: 8,
      unit: 'EA',
      unit_cost: 1875,
      total_cost: 15000,
      // Cost tracking - under budget
      initial_cost: 15000,
      actual_cost: 14200,
      cost_variance: -800,
      cost_variance_percentage: -5.33,
      subcontractor_id: 'sub-001',
      notes: 'Interactive display units with LED lighting',
      created_by: 'user-002',
      created_at: '2024-01-18T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z'
    },
    {
      id: 'SCOPE010',
      project_id: 'proj-010',
      project_name: 'Turkcell Data Center Cooling',
      title: 'Data Center Infrastructure',
      description: 'Complete cooling and power distribution system',
      category: 'mechanical',
      specification: 'CRAC units, PDUs, hot/cold aisle containment',
      quantity: 1,
      unit: 'LOT',
      unit_cost: 95000,
      total_cost: 95000,
      // Cost tracking - significantly over budget (major variance)
      initial_cost: 95000,
      actual_cost: 108000,
      cost_variance: 13000,
      cost_variance_percentage: 13.68,
      subcontractor_id: 'sub-003',
      subcontractor_name: 'ProTech HVAC Systems',
      subcontractor_trade: 'hvac',
      subcontractor_contact_person: 'Mike Chen',
      subcontractor_phone: '+1 555-0345',
      notes: 'Complete cooling and power infrastructure for server racks',
      created_by: 'user-002',
      created_at: '2023-10-15T10:00:00Z',
      updated_at: '2023-12-20T10:00:00Z'
    }
  ]

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
      setExpandedRows(new Set(paginatedItems.map(item => item.id)))
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
    new Map(scopeItems.map(item => [item.project_id, { id: item.project_id, name: item.project_name }])).values()
  )
  
  const uniqueCategories = Array.from(new Set(scopeItems.map(item => item.category)))
  const uniqueSubcontractors = Array.from(
    new Map(scopeItems.map(item => [item.subcontractor_id, { 
      id: item.subcontractor_id, 
      name: item.subcontractor?.name || 'Unassigned',
      trade: item.subcontractor?.trade || '',
      contact_person: item.subcontractor?.contact_person || '' 
    }])).values()
  )

  // Filter scope items based on all filters
  const filteredScopeItems = scopeItems.filter(item => {
    const matchesProject = selectedProject === 'all' || item.project_id === selectedProject
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.specification.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category)
    const matchesSubcontractor = selectedSubcontractors.length === 0 || selectedSubcontractors.includes(item.subcontractor_id)
    
    return matchesProject && matchesSearch && matchesCategory && matchesSubcontractor
  })
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedProject('all')
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedSubcontractors([])
  }
  
  const hasActiveFilters = selectedProject !== 'all' || searchTerm || selectedCategories.length > 0 || selectedSubcontractors.length > 0
  
  // Calculate pagination
  const totalFilteredItems = filteredScopeItems.length
  const calculatedTotalPages = Math.ceil(totalFilteredItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredScopeItems.slice(startIndex, endIndex)
  
  // Update total pages when filters change
  React.useEffect(() => {
    setTotalPages(calculatedTotalPages)
    // Reset to page 1 if current page is beyond available pages
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1)
    }
  }, [calculatedTotalPages, currentPage])
  
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm">
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
                        onClick={() => setSelectedSubcontractors(uniqueSubcontractors.map(s => s.id))}
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
                            checked={selectedSubcontractors.includes(subcontractor.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
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
                
                {/* Essential Financial Metrics - Prioritized */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-800">Revenue:</span>
                    <span className="text-blue-700 font-bold text-base">
                      {formatCurrency(filteredScopeItems.reduce((sum, item) => sum + item.total_cost, 0))}
                    </span>
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <span className="text-gray-800">Profit:</span>
                    <span className={`font-bold text-base ${
                      filteredScopeItems.reduce((sum, item) => sum + calculateProfit(item.total_cost, item.actual_cost), 0) >= 0 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      {formatCurrency(filteredScopeItems.reduce((sum, item) => sum + calculateProfit(item.total_cost, item.actual_cost), 0))}
                    </span>
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <span className="text-gray-800">Margin:</span>
                    <span className="text-purple-700 font-bold text-base">
                      {filteredScopeItems.length > 0 
                        ? (filteredScopeItems.reduce((sum, item) => sum + calculateProfitPercentage(item.total_cost, item.actual_cost), 0) / filteredScopeItems.length).toFixed(1)
                        : '0.0'
                      }%
                    </span>
                  </span>
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
              <TableHead className="text-right font-bold text-gray-800 w-28 py-4">Unit Price</TableHead>
              <TableHead className="text-right font-bold text-gray-800 w-32 py-4">Total Price</TableHead>
              <TableHead className="w-16 font-bold text-gray-800 py-4">Assigned</TableHead>
              <TableHead className="text-center font-bold text-gray-800 w-16 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => {
              const isExpanded = expandedRows.has(item.id)
              return (
                <React.Fragment key={item.id}>
                  <TableRow 
                    className={`group hover:bg-gray-100/80 transition-all duration-200 ${getRowAccentColor(item.category)} ${getCostPriority(item.total_cost) === 'cost-high' ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''} ${isExpanded ? 'bg-blue-50/40' : ''} cursor-pointer`}
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
                    <TableCell className="font-mono text-sm py-4 font-medium text-gray-800">{item.id}</TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        className={`${getCategoryColor(item.category)} font-semibold transition-colors border text-sm px-3 py-2`}
                      >
                        {getCategoryIcon(item.category)}
                        <span className="ml-1">{getCategoryLabel(item.category)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold py-4 text-gray-900">{item.title}</TableCell>
                    <TableCell className="text-center font-bold py-4 text-base">{item.quantity}</TableCell>
                    <TableCell className="text-sm py-4 font-medium text-gray-800">{item.unit}</TableCell>
                    <TableCell className="text-right py-4 font-mono text-base font-medium text-gray-800">{formatCurrency(item.unit_cost)}</TableCell>
                    <TableCell className="text-right py-4 font-mono text-lg font-bold text-blue-700">
                      {formatCurrency(item.total_cost)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${getCategoryColor(item.category).split(' ')[0]} ${getCategoryColor(item.category).split(' ')[1]} cursor-pointer shadow-sm hover:shadow-md transition-shadow`} 
                             title={`${item.subcontractor?.name || 'Unassigned'}\n${item.subcontractor?.trade || ''}\n${item.subcontractor?.contact_person || ''}\n${item.subcontractor?.phone || ''}`}>
                          {(item.subcontractor?.name || 'UN').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
                      <TableCell colSpan={10} className={`bg-gray-100 py-4 ${getRowAccentColor(item.category)}`}>
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

                          {/* Profit Analysis Section (30%) */}
                          <div className="flex-1 lg:flex-[2]">
                            <div className={`bg-white rounded-lg p-3 border-l-4 ${getProfitHealthColor(calculateProfitPercentage(item.total_cost, item.actual_cost)).includes('green') ? 'border-l-green-500' : getProfitHealthColor(calculateProfitPercentage(item.total_cost, item.actual_cost)).includes('yellow') ? 'border-l-yellow-500' : 'border-l-red-500'} border border-gray-200`}>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Sales:</span>
                                  <span className="font-medium">{formatCurrency(item.total_cost)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Cost:</span>
                                  <span className="font-medium">{formatCurrency(item.actual_cost)}</span>
                                </div>
                                <div className="border-t pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Profit:</span>
                                    <div className="text-right">
                                      <div className={`font-bold ${calculateProfitPercentage(item.total_cost, item.actual_cost) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {formatCurrency(calculateProfit(item.total_cost, item.actual_cost))}
                                      </div>
                                      <div className={`text-lg font-bold ${getProfitHealthColor(calculateProfitPercentage(item.total_cost, item.actual_cost)).includes('green') ? 'text-green-700' : getProfitHealthColor(calculateProfitPercentage(item.total_cost, item.actual_cost)).includes('yellow') ? 'text-yellow-700' : 'text-red-700'}`}>
                                        {calculateProfitPercentage(item.total_cost, item.actual_cost).toFixed(1)}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center pt-1">
                                  <span className={`text-xs px-2 py-1 rounded ${getProfitHealthColor(calculateProfitPercentage(item.total_cost, item.actual_cost))} font-medium flex items-center gap-1`}>
                                    {getProfitHealthIcon(calculateProfitPercentage(item.total_cost, item.actual_cost))}
                                    {getProfitHealth(calculateProfitPercentage(item.total_cost, item.actual_cost)) === 'healthy' ? 'Healthy Margin' : 
                                     getProfitHealth(calculateProfitPercentage(item.total_cost, item.actual_cost)) === 'acceptable' ? 'Acceptable Margin' : 
                                     calculateProfitPercentage(item.total_cost, item.actual_cost) < 0 ? 'Loss - Review!' : 'Thin Margin'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

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
                              {new Date(item.created_at).toLocaleDateString()}
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
      
      {/* Pagination */}
      {totalPages > 1 && (
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
      
      {/* View Scope Item Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={`w-4 h-4 rounded ${selectedItem ? getRowAccentColor(selectedItem.category).replace('border-l-4 border-l-', 'bg-') : 'bg-gray-400'}`}></div>
              {selectedItem?.title}
              <Badge className={`${selectedItem ? getCategoryColor(selectedItem.category) : 'bg-gray-100'} text-xs`}>
                {selectedItem ? getCategoryLabel(selectedItem.category) : 'Unknown'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Scope Item: {selectedItem?.id} • Project: {selectedItem?.project_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Basic Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-700">Description:</span>
                      <p className="mt-1">{selectedItem.description}</p>
                    </div>
                    <div>
                      <span className="text-gray-700">Specification:</span>
                      <p className="mt-1">{selectedItem.specification}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-700">Quantity:</span>
                        <p className="font-medium">{selectedItem.quantity} {selectedItem.unit}</p>
                      </div>
                      <div>
                        <span className="text-gray-700">Unit Price:</span>
                        <p className="font-medium">{formatCurrency(selectedItem.unit_cost)}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-700">Notes:</span>
                      <p className="mt-1 text-xs text-gray-800">{selectedItem.notes || 'No additional notes'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Financial Analysis */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-blue-600">💰</span>
                    Financial Overview
                  </h4>
                  <div className="space-y-4 text-sm">
                    {/* Revenue */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="text-gray-800 text-xs uppercase tracking-wide">Total Revenue</span>
                      <p className="text-xl font-bold text-blue-700">{formatCurrency(selectedItem.total_cost)}</p>
                    </div>
                    
                    {/* Costs */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Initial Budget:</span>
                        <span className="font-medium">{formatCurrency(selectedItem.initial_cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Actual Cost:</span>
                        <span className={`font-medium ${selectedItem.cost_variance > 0 ? 'text-red-600' : selectedItem.cost_variance < 0 ? 'text-green-600' : 'text-blue-600'}`}>
                          {formatCurrency(selectedItem.actual_cost)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-700">Cost Variance:</span>
                        <div className="text-right">
                          <span className={`font-medium ${selectedItem.cost_variance > 0 ? 'text-red-600' : selectedItem.cost_variance < 0 ? 'text-green-600' : 'text-blue-600'}`}>
                            {selectedItem.cost_variance > 0 ? '+' : ''}{formatCurrency(selectedItem.cost_variance)}
                          </span>
                          <div className={`text-xs ${selectedItem.cost_variance > 0 ? 'text-red-500' : selectedItem.cost_variance < 0 ? 'text-green-500' : 'text-blue-500'}`}>
                            ({selectedItem.cost_variance > 0 ? '+' : ''}{selectedItem.cost_variance_percentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Profit Analysis */}
                    <div className={`p-3 rounded-lg ${getProfitHealthColor(calculateProfitPercentage(selectedItem.total_cost, selectedItem.actual_cost))}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Profit Margin</span>
                        <div className="text-right">
                          <span className="text-lg font-bold">{formatCurrency(calculateProfit(selectedItem.total_cost, selectedItem.actual_cost))}</span>
                          <div className="text-sm">
                            {calculateProfitPercentage(selectedItem.total_cost, selectedItem.actual_cost).toFixed(1)}% margin
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs">
                        {getProfitHealth(calculateProfitPercentage(selectedItem.total_cost, selectedItem.actual_cost)) === 'healthy' ? 'Healthy profit margin' : 
                         getProfitHealth(calculateProfitPercentage(selectedItem.total_cost, selectedItem.actual_cost)) === 'acceptable' ? 'Acceptable profit margin' : 'Thin profit margin - review pricing'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subcontractor & Project Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assignment Details
                  </h4>
                  <div className="space-y-4 text-sm">
                    {/* Subcontractor Info */}
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getCategoryColor(selectedItem.category).split(' ')[0]} ${getCategoryColor(selectedItem.category).split(' ')[1]}`}>
                          {(selectedItem.subcontractor?.name || 'UN').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{selectedItem.subcontractor?.name || 'Unassigned'}</div>
                          <div className={`text-sm capitalize ${getCategoryColor(selectedItem.category).split(' ')[1]} font-medium`}>
                            {selectedItem.subcontractor?.trade || ''}
                          </div>
                          <div className="text-xs text-gray-700 mt-2 space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {selectedItem.subcontractor?.contact_person || ''}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-blue-600">📞</span>
                              {selectedItem.subcontractor?.phone || ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Created:</span>
                        <span className="text-xs">{new Date(selectedItem.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Last Updated:</span>
                        <span className="text-xs">{new Date(selectedItem.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setViewModalOpen(false)
                if (selectedItem) handleEdit(selectedItem)
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Scope Item Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <Edit className="h-5 w-5 text-emerald-600" />
              Edit Scope Item
              {selectedItem && (
                <Badge className={`${getCategoryColor(selectedItem.category)} text-xs`}>
                  {getCategoryLabel(selectedItem.category)}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Editing: {selectedItem?.id} • {selectedItem?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6 py-4">
              {/* Basic Information Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Title</label>
                  <Input 
                    defaultValue={selectedItem.title}
                    placeholder="Scope item title"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Category</label>
                  <Select defaultValue={selectedItem.category}>
                    <SelectTrigger>
                      <SelectValue />
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
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-800 mb-1 block">Description</label>
                <Input 
                  defaultValue={selectedItem.description}
                  placeholder="Detailed description of the scope item"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-800 mb-1 block">Specification</label>
                <Input 
                  defaultValue={selectedItem.specification}
                  placeholder="Technical specifications and requirements"
                  className="w-full"
                />
              </div>
              
              {/* Quantity and Pricing */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Quantity</label>
                  <Input 
                    type="number"
                    defaultValue={selectedItem.quantity}
                    min="0"
                    step="0.01"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Unit</label>
                  <Input 
                    defaultValue={selectedItem.unit}
                    placeholder="EA, SF, LF, etc."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Unit Price</label>
                  <Input 
                    type="number"
                    defaultValue={selectedItem.unit_cost}
                    min="0"
                    step="0.01"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800 mb-1 block">Total Price</label>
                  <div className="bg-gray-100 px-3 py-2 rounded-md text-sm font-semibold text-blue-700">
                    {formatCurrency(selectedItem.total_cost)}
                  </div>
                  <p className="text-xs text-gray-700 mt-1">Auto-calculated</p>
                </div>
              </div>
              
              {/* Cost Management (Admin Only) */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-orange-600">💰</span>
                  Cost Management
                  <Badge variant="secondary" className="text-xs">Admin Only</Badge>
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-800 mb-1 block">Initial Budget</label>
                    <Input 
                      type="number"
                      defaultValue={selectedItem.initial_cost}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-800 mb-1 block">Actual Cost</label>
                    <Input 
                      type="number"
                      defaultValue={selectedItem.actual_cost}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Profit Preview */}
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-800">Estimated Profit:</span>
                    <div className="text-right">
                      <span className={`font-semibold ${calculateProfitPercentage(selectedItem.total_cost, selectedItem.actual_cost) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(calculateProfit(selectedItem.total_cost, selectedItem.actual_cost))}
                      </span>
                      <div className="text-xs text-gray-700">
                        {calculateProfitPercentage(selectedItem.total_cost, selectedItem.actual_cost).toFixed(1)}% margin
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Assignment */}
              <div>
                <label className="text-sm font-medium text-gray-800 mb-1 block">Assigned Subcontractor</label>
                <Select defaultValue={selectedItem.subcontractor_id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sub-001">Premium Woodworks LLC - Millwork</SelectItem>
                    <SelectItem value="sub-002">Elite Custom Millwork - Millwork</SelectItem>
                    <SelectItem value="sub-003">ProTech HVAC Systems - HVAC</SelectItem>
                    <SelectItem value="sub-004">Apex Steel Construction - Construction</SelectItem>
                    <SelectItem value="sub-005">PowerMax Electrical - Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-800 mb-1 block">Notes</label>
                <textarea 
                  defaultValue={selectedItem.notes || ''}
                  placeholder="Additional notes and comments..."
                  className="w-full min-h-20 px-3 py-2 border border-gray-400 rounded-md text-sm resize-y"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // TODO: Collect form data and call handleSaveEdit
                if (selectedItem) {
                  handleSaveEdit(selectedItem)
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Scope Item Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Scope Item
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the scope item.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-4">
              {/* Item Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded mt-0.5 ${getRowAccentColor(selectedItem.category).replace('border-l-4 border-l-', 'bg-')}`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{selectedItem.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedItem.id} • {getCategoryLabel(selectedItem.category)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedItem.quantity} {selectedItem.unit} @ {formatCurrency(selectedItem.unit_cost)} = {formatCurrency(selectedItem.total_cost)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Impact Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 text-sm">⚠️</span>
                  <div className="text-sm">
                    <div className="font-medium text-yellow-800 mb-1">Deletion Impact</div>
                    <ul className="text-yellow-700 space-y-1 text-xs">
                      <li>• Financial data will be permanently lost</li>
                      <li>• Assigned subcontractor will be unlinked</li>
                      <li>• Related documentation may need updating</li>
                      <li>• Project budgets and reports will be affected</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Confirmation Input */}
              <div>
                <label className="text-sm font-medium text-gray-800 mb-2 block">
                  To confirm deletion, type the scope item ID: <span className="font-mono text-red-600">{selectedItem.id}</span>
                </label>
                <Input 
                  placeholder={`Type "${selectedItem.id}" to confirm`}
                  className="w-full"
                  id="deleteConfirmation"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                // TODO: Verify confirmation input matches scope ID
                const confirmationInput = document.getElementById('deleteConfirmation') as HTMLInputElement
                if (confirmationInput?.value === selectedItem?.id) {
                  handleConfirmDelete()
                } else {
                  alert('Please type the correct scope item ID to confirm deletion')
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}