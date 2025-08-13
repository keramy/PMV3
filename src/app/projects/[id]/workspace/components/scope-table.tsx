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
  completion_percentage: number | null
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

  // Scope items data aligned with FUTURE database schema using subcontractors
  // Current DB: scope_items.assigned_to -> user_profiles (V2 pattern)
  // Future DB: scope_items.subcontractor_id -> subcontractors (V3 pattern)
  // Standardized field naming: subcontractor_contact_person (matches DB subcontractors.contact_person)
  // Ready for database migration to subcontractor-based assignments
  const scopeItems: ScopeItemWithSubcontractor[] = [
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
      completion_percentage: 45,
      created_by: 'user-002',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    // ... (rest of scopeItems data - using the same pattern from UI Preview)
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
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
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
    return accents[category] || 'border-l-4 border-l-gray-300'
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
    new Map(scopeItems.map(item => [item.project_id, { id: item.project_id, name: `Project ${item.project_id}` }])).values()
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
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.specification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            Scope Management
            {totalPages > 1 && (
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Project scope items and deliverables
            {totalPages > 1 && (
              <span className="text-gray-500"> • {totalFilteredItems} total items</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={toggleAllRows} className="hover:bg-gray-100 transition-colors">
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

      {/* Search and basic table display (simplified for component copy) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search scope items..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Simplified Table for initial copy */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(item.category)}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                </TableCell>
                <TableCell>{item.quantity} {item.unit}</TableCell>
                <TableCell>{formatCurrency(item.unit_cost)}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(item.total_cost)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleView(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}