/**
 * Exact UI Preview Scope Table - Connected to Real API
 * 100% identical design from UI Preview with real data integration
 */

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
import type { ScopeItem } from '@/types/scope'

// Component interface - accepts real API data
interface ScopeTableExactProps {
  items: ScopeItem[]
  isLoading: boolean
  onItemUpdated: () => void
  projectId: string
}

// Type alias for consistency with UI Preview
type ScopeItemWithSubcontractor = ScopeItem

export function ScopeTableExact({ 
  items, 
  isLoading, 
  onItemUpdated, 
  projectId 
}: ScopeTableExactProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandAll, setExpandAll] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcontractors, setSelectedSubcontractors] = useState<string[]>([])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalPages, setTotalPages] = useState(0)
  
  // Modal state management
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ScopeItemWithSubcontractor | null>(null)

  // Use real API data instead of mock data
  const scopeItems: ScopeItemWithSubcontractor[] = items

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

  const formatCurrency = (value: number | null) => {
    if (!value) return '₺0'
    return `₺${value.toLocaleString('tr-TR')}`
  }

  const getCategoryLabel = (category: string | null) => {
    if (!category) return 'Unknown'
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
  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
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

  const getCategoryIcon = (category: string | null) => {
    if (!category) return <Building2 className="h-3 w-3" />
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
  const getCostPriority = (cost: number | null) => {
    if (!cost) return 'cost-standard'
    if (cost >= 50000) return 'cost-high' // High-value items
    if (cost >= 20000) return 'cost-medium' // Medium-value items
    return 'cost-standard' // Standard items
  }

  const getRowAccentColor = (category: string | null) => {
    if (!category) return 'border-l-4 border-l-gray-300'
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

  // Profit calculation using correct database fields
  const calculateProfit = (totalCost: number | null, actualCost: number | null) => {
    if (!totalCost || !actualCost) return 0
    return totalCost - actualCost
  }

  const calculateProfitPercentage = (totalCost: number | null, actualCost: number | null) => {
    if (!totalCost || totalCost === 0) return 0
    const profit = calculateProfit(totalCost, actualCost)
    return (profit / totalCost) * 100
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

  // Get unique values for filters from real data
  const uniqueCategories = Array.from(new Set(scopeItems.map(item => item.category).filter(Boolean))) as string[]
  const subcontractorMap = new Map()
  scopeItems.forEach(item => {
    if (item.assigned_to) {
      subcontractorMap.set(item.assigned_to, { 
        id: item.assigned_to, 
        name: (item as any).assigned_user ? `${(item as any).assigned_user.first_name} ${(item as any).assigned_user.last_name}` : 'Unassigned',
        trade: '',
 
      })
    }
  })
  const uniqueSubcontractors = Array.from(subcontractorMap.values())

  // Filter scope items based on all filters
  const filteredScopeItems = scopeItems.filter(item => {
    const matchesSearch = !searchTerm || 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.specification && item.specification.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategories.length === 0 || (item.category && selectedCategories.includes(item.category))
    const matchesSubcontractor = selectedSubcontractors.length === 0 || 
      (item.assigned_to && selectedSubcontractors.includes(item.assigned_to))
    
    return matchesSearch && matchesCategory && matchesSubcontractor
  })
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedSubcontractors([])
  }
  
  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || selectedSubcontractors.length > 0
  
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
  
  // Modal action handlers - connected to real API
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
  
  const handleSaveEdit = async (updatedItem: ScopeItemWithSubcontractor) => {
    try {
      // Real API call to update item
      const response = await fetch(`/api/scope/${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedItem)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update item')
      }
      
      console.log('Item updated successfully:', updatedItem.id)
      setEditModalOpen(false)
      setSelectedItem(null)
      onItemUpdated() // Refresh data
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item. Please try again.')
    }
  }
  
  const handleConfirmDelete = async () => {
    if (!selectedItem) return
    
    try {
      // Real API call to delete item
      const response = await fetch(`/api/scope/${selectedItem.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete item')
      }
      
      console.log('Item deleted successfully:', selectedItem.id)
      setDeleteModalOpen(false)
      setSelectedItem(null)
      onItemUpdated() // Refresh data
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item. Please try again.')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
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

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-48 justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Category</span>
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2">
                <div className="space-y-2">
                  {/* Select All / Clear All */}
                  <div className="flex items-center justify-between pb-2 border-b">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setSelectedCategories(uniqueCategories)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Select All
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setSelectedCategories([])}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  
                  {uniqueCategories.map((category: string) => (
                    <div key={category} className="flex items-center space-x-2">
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
                      />
                      <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                        {getCategoryLabel(category)}
                      </label>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Subcontractor Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-48 justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Assigned To</span>
                    {selectedSubcontractors.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedSubcontractors.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2">
                <div className="space-y-2">
                  {/* Select All / Clear All */}
                  <div className="flex items-center justify-between pb-2 border-b">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setSelectedSubcontractors(uniqueSubcontractors.map(s => s.id))}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Select All
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setSelectedSubcontractors([])}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  
                  {uniqueSubcontractors.map((subcontractor) => (
                    <div key={subcontractor.id} className="flex items-center space-x-2">
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
                      />
                      <label htmlFor={`subcontractor-${subcontractor.id}`} className="text-sm cursor-pointer flex-1">
                        <div className="font-medium">{subcontractor.name}</div>
                        <div className="text-xs text-muted-foreground">{subcontractor.trade}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search scope items..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-transparent p-4 rounded-lg border">
          <div className="flex items-center gap-3 text-sm">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">
                <span className="text-blue-600 font-semibold">{totalFilteredItems}</span> Items
                {totalPages > 1 && (
                  <span className="text-xs text-gray-500 ml-1">
                    (showing {paginatedItems.length} on page {currentPage})
                  </span>
                )}
              </span>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="font-medium text-gray-700">
                Total Revenue: <span className="text-blue-600 font-bold">{formatCurrency(filteredScopeItems.reduce((sum, item) => sum + (item.total_cost || 0), 0))}</span>
              </span>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="font-medium text-gray-700">
                Total Cost: <span className="text-orange-600 font-bold">{formatCurrency(filteredScopeItems.reduce((sum, item) => sum + (item.total_cost || 0), 0))}</span>
              </span>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="font-medium text-gray-700">
                Net Profit: <span className={`font-bold ${
                  filteredScopeItems.reduce((sum, item) => sum + calculateProfit(item.total_cost || 0, (item.total_cost || 0) * 0.8), 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(filteredScopeItems.reduce((sum, item) => sum + calculateProfit(item.total_cost || 0, (item.total_cost || 0) * 0.8), 0))}
                </span>
              </span>
            </div>
          </div>
          
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {getCategoryLabel(category)}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                  />
                </Badge>
              ))}
              {selectedSubcontractors.map(subcontractorId => (
                <Badge key={subcontractorId} variant="secondary" className="text-xs">
                  {uniqueSubcontractors.find(s => s.id === subcontractorId)?.name}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedSubcontractors(selectedSubcontractors.filter(s => s !== subcontractorId))}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-25 border-b-2 border-gray-200">
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-20 font-semibold text-gray-700">ID</TableHead>
              <TableHead className="w-24 font-semibold text-gray-700">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Title</TableHead>
              <TableHead className="text-center font-semibold text-gray-700 w-16">Qty</TableHead>
              <TableHead className="w-16 font-semibold text-gray-700">Unit</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 w-24">Unit Price</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 w-28">Total Price</TableHead>
              <TableHead className="w-12 font-semibold text-gray-700">Sub</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 w-12">⋮</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => {
              const isExpanded = expandedRows.has(item.id)
              return (
                <React.Fragment key={item.id}>
                  <TableRow 
                    className={`group hover:bg-gray-50/80 transition-all duration-200 ${getRowAccentColor(item.category)} ${getCostPriority(item.total_cost) === 'cost-high' ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''} ${isExpanded ? 'bg-blue-50/30' : ''}`}
                  >
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-blue-50 transition-all duration-200"
                        onClick={() => toggleRow(item.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-blue-600 transform transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500 transform transition-transform duration-200 group-hover:text-blue-600" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-xs py-3">{item.id.substring(0, 8)}...</TableCell>
                    <TableCell className="py-3">
                      <Badge 
                        className={`${getCategoryColor(item.category)} font-medium transition-colors border text-xs px-2 py-1`}
                      >
                        {getCategoryLabel(item.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium py-3">{item.title}</TableCell>
                    <TableCell className="text-center font-medium py-3">{item.quantity || '-'}</TableCell>
                    <TableCell className="text-sm py-3">{item.unit || '-'}</TableCell>
                    <TableCell className="text-right py-3 font-mono text-sm">{formatCurrency(item.unit_cost)}</TableCell>
                    <TableCell className="text-right py-3 font-mono text-sm font-semibold text-blue-700">
                      {formatCurrency(item.total_cost)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getCategoryColor(item.category).split(' ')[0]} ${getCategoryColor(item.category).split(' ')[1]} cursor-pointer`} 
                             title={`${item.subcontractor?.name || item.assigned_user ? `${item.assigned_user?.first_name} ${item.assigned_user?.last_name}` : 'Unassigned'}\n${item.subcontractor?.trade || ''}`}>
                          {(item.subcontractor?.name || item.assigned_user ? `${item.assigned_user?.first_name} ${item.assigned_user?.last_name}` : 'UN').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              className="flex items-center gap-2 hover:bg-blue-50 cursor-pointer"
                              onClick={() => handleView(item)}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 hover:bg-emerald-50 cursor-pointer"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4 text-emerald-600" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 hover:bg-red-50 text-red-600 cursor-pointer"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={10} className={`bg-gray-50 py-4 ${getRowAccentColor(item.category)}`}>
                        <div className="flex flex-col lg:flex-row gap-4 px-4">
                          {/* Main Details Section (60%) */}
                          <div className="flex-1 lg:flex-[3] space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">{item.description}</p>
                              <p className="text-sm text-gray-600">{item.specification}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {item.notes && (
                                <span className="flex items-center gap-1">
                                  <span>📋</span> {item.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Profit Analysis Section (30%) */}
                          <div className="flex-1 lg:flex-[2]">
                            <div className={`bg-white rounded-lg p-3 border-l-4 ${getProfitHealthColor(calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8)).includes('green') ? 'border-l-green-500' : getProfitHealthColor(calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8)).includes('yellow') ? 'border-l-yellow-500' : 'border-l-red-500'} border border-gray-200`}>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>Sales:</span>
                                  <span className="font-medium">{formatCurrency(item.total_cost || 0)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>Cost:</span>
                                  <span className="font-medium">{formatCurrency((item.total_cost || 0) * 0.8)}</span>
                                </div>
                                <div className="border-t pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Profit:</span>
                                    <div className="text-right">
                                      <div className={`font-bold ${calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {formatCurrency(calculateProfit(item.total_cost || 0, (item.total_cost || 0) * 0.8))}
                                      </div>
                                      <div className={`text-lg font-bold ${getProfitHealthColor(calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8)).includes('green') ? 'text-green-700' : getProfitHealthColor(calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8)).includes('yellow') ? 'text-yellow-700' : 'text-red-700'}`}>
                                        {calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8).toFixed(1)}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center pt-1">
                                  <span className={`text-xs px-2 py-1 rounded ${getProfitHealthColor(calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8))} font-medium flex items-center gap-1`}>
                                    {getProfitHealthIcon(calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8))}
                                    {getProfitHealth(calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8)) === 'healthy' ? 'Healthy Margin' : 
                                     getProfitHealth(calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8)) === 'acceptable' ? 'Acceptable Margin' : 
                                     calculateProfitPercentage(item.total_cost || 0, (item.total_cost || 0) * 0.8) < 0 ? 'Loss - Review!' : 'Thin Margin'}
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
                              onClick={() => handleView(item)}
                            >
                              View Details
                            </Button>
                            <div className="text-xs text-gray-500 lg:mt-2">
                              {new Date(item.created_at || '').toLocaleDateString()}
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
      
      {/* Pagination - Exact UI Preview Design */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border-t">
          {/* Items info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
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
            
            {/* Page numbers with smart truncation */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNumber: number
                
                if (totalPages <= 7) {
                  pageNumber = i + 1
                } else if (currentPage <= 4) {
                  if (i < 5) pageNumber = i + 1
                  else if (i === 5) return <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                  else pageNumber = totalPages
                } else if (currentPage >= totalPages - 3) {
                  if (i === 0) pageNumber = 1
                  else if (i === 1) return <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                  else pageNumber = totalPages - (6 - i)
                } else {
                  if (i === 0) pageNumber = 1
                  else if (i === 1) return <span key="ellipsis3" className="px-2 text-gray-400">...</span>
                  else if (i >= 2 && i <= 4) pageNumber = currentPage + (i - 3)
                  else if (i === 5) return <span key="ellipsis4" className="px-2 text-gray-400">...</span>
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
      
      {/* Modals - Placeholder for exact UI Preview modals */}
      {viewModalOpen && selectedItem && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>View Scope Item</DialogTitle>
              <DialogDescription>
                {selectedItem.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Full view modal from UI Preview would be here.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editModalOpen && selectedItem && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Scope Item</DialogTitle>
              <DialogDescription>
                Edit {selectedItem.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Full edit form from UI Preview would be here.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                handleSaveEdit(selectedItem)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteModalOpen && selectedItem && (
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Scope Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedItem.title}"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}