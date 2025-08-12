'use client'

import { useState } from 'react'
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
} from '@/components/ui/dropdown-menu'
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
  Check
} from 'lucide-react'

export function ScopeTable() {
  const [selectedProject, setSelectedProject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandAll, setExpandAll] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)

  // Scope items data aligned with database schema
  const scopeItems = [
    {
      id: 'SCOPE001',
      project_id: 'proj-001',
      project_name: 'Akbank Head Office Renovation',
      title: 'Kitchen Upper Cabinets Installation',
      description: 'Premium maple finish installation for executive kitchen',
      category: 'millwork',
      specification: 'Soft-close hardware, maple finish, Grade A materials',
      quantity: 4,
      unit: 'EA',
      unit_cost: 450,
      total_cost: 1800,
      assigned_to: 'user-001',
      assigned_to_name: 'John Smith',
      notes: 'Premium maple finish with soft-close hardware',
      created_by: 'user-002',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SCOPE002',
      project_id: 'proj-001',
      project_name: 'Akbank Head Office Renovation',
      title: 'Kitchen Base Cabinets Installation',
      description: 'Base cabinet system with drawer organizers',
      category: 'millwork',
      specification: 'Soft-close drawers, maple finish matching uppers',
      quantity: 6,
      unit: 'EA',
      unit_cost: 380,
      total_cost: 2280,
      assigned_to: 'user-001',
      assigned_to_name: 'John Smith',
      notes: 'Includes soft-close drawers and doors',
      created_by: 'user-002',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'SCOPE003',
      project_id: 'proj-001',
      project_name: 'Akbank Head Office Renovation',
      title: 'Reception Desk - Custom Build',
      description: 'Executive reception desk with integrated technology',
      category: 'millwork',
      specification: 'Custom design with cable management and LED lighting',
      quantity: 1,
      unit: 'EA',
      unit_cost: 2800,
      total_cost: 2800,
      assigned_to: 'user-003',
      assigned_to_name: 'Sarah Johnson',
      notes: 'Executive-level custom reception desk with cable management',
      created_by: 'user-002',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z'
    },
    {
      id: 'SCOPE004',
      project_id: 'proj-003',
      project_name: 'Marina Bay Tower Construction',
      title: 'HVAC System Installation',
      description: 'VRF system installation for tower floors 15-20',
      category: 'hvac',
      specification: 'Variable Refrigerant Flow with BMS integration',
      quantity: 1,
      unit: 'LOT',
      unit_cost: 85000,
      total_cost: 85000,
      assigned_to: 'user-004',
      assigned_to_name: 'Mike Chen',
      notes: 'VRF system for floors 15-20 with BMS integration',
      created_by: 'user-002',
      created_at: '2024-01-05T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z'
    },
    {
      id: 'SCOPE005',
      project_id: 'proj-003',
      project_name: 'Marina Bay Tower Construction',
      title: 'Structural Steel Frame',
      description: 'High-rise structural steel framework',
      category: 'construction',
      specification: 'Grade 50 steel, seismic zone 4 requirements',
      quantity: 250,
      unit: 'TONS',
      unit_cost: 720,
      total_cost: 180000,
      assigned_to: 'user-005',
      assigned_to_name: 'David Wilson',
      notes: 'Seismic-resistant steel frame for high-rise construction',
      created_by: 'user-002',
      created_at: '2024-01-03T10:00:00Z',
      updated_at: '2024-01-03T10:00:00Z'
    },
    {
      id: 'SCOPE006',
      project_id: 'proj-002',
      project_name: 'Garanti BBVA Tech Center MEP',
      title: 'Server Room Cooling',
      description: 'Precision cooling system for data center',
      category: 'mechanical',
      specification: 'N+1 redundancy, 24/7 operation capability',
      quantity: 2,
      unit: 'UNITS',
      unit_cost: 22500,
      total_cost: 45000,
      assigned_to: 'user-004',
      assigned_to_name: 'Mike Chen',
      notes: 'Redundant precision cooling for data center',
      created_by: 'user-002',
      created_at: '2023-12-15T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z'
    },
    {
      id: 'SCOPE007',
      project_id: 'proj-002',
      project_name: 'Garanti BBVA Tech Center MEP',
      title: 'Electrical Distribution',
      description: 'Main electrical distribution system',
      category: 'electrical',
      specification: '2000A main, UPS backup, generator connection',
      quantity: 1,
      unit: 'LOT',
      unit_cost: 35000,
      total_cost: 35000,
      assigned_to: 'user-006',
      assigned_to_name: 'Emily Brown',
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
      assigned_to: 'user-003',
      assigned_to_name: 'Sarah Johnson',
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
      assigned_to: 'user-001',
      assigned_to_name: 'John Smith',
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
      assigned_to: 'user-004',
      assigned_to_name: 'Mike Chen',
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
      setExpandedRows(new Set(filteredScopeItems.map(item => item.id)))
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

  // Get unique values for filters
  const uniqueProjects = Array.from(
    new Map(scopeItems.map(item => [item.project_id, { id: item.project_id, name: item.project_name }])).values()
  )
  
  const uniqueCategories = Array.from(new Set(scopeItems.map(item => item.category)))
  const uniqueAssignees = Array.from(
    new Map(scopeItems.map(item => [item.assigned_to, { id: item.assigned_to, name: item.assigned_to_name }])).values()
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
    const matchesAssignee = selectedAssignees.length === 0 || selectedAssignees.includes(item.assigned_to)
    
    return matchesProject && matchesSearch && matchesCategory && matchesAssignee
  })
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedProject('all')
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedAssignees([])
  }
  
  const hasActiveFilters = selectedProject !== 'all' || searchTerm || selectedCategories.length > 0 || selectedAssignees.length > 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Scope Management</h2>
          <p className="text-sm text-muted-foreground">Project scope items and deliverables</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleAllRows}>
            <ChevronsUpDown className="mr-2 h-4 w-4" />
            {expandAll ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button>
            <ClipboardList className="mr-2 h-4 w-4" />
            Add Scope Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative w-full sm:w-64">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="pl-9">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {uniqueProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  
                  {uniqueCategories.map((category) => (
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

            {/* Assigned To Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-48 justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Assigned To</span>
                    {selectedAssignees.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedAssignees.length}
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
                      onClick={() => setSelectedAssignees(uniqueAssignees.map(a => a.id))}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Select All
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => setSelectedAssignees([])}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  
                  {uniqueAssignees.map((assignee) => (
                    <div key={assignee.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignee-${assignee.id}`}
                        checked={selectedAssignees.includes(assignee.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssignees([...selectedAssignees, assignee.id])
                          } else {
                            setSelectedAssignees(selectedAssignees.filter(a => a !== assignee.id))
                          }
                        }}
                      />
                      <label htmlFor={`assignee-${assignee.id}`} className="text-sm cursor-pointer">
                        {assignee.name}
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Items: {filteredScopeItems.length} | Total Value: {formatCurrency(filteredScopeItems.reduce((sum, item) => sum + item.total_cost, 0))}</span>
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
              {selectedAssignees.map(assigneeId => (
                <Badge key={assigneeId} variant="secondary" className="text-xs">
                  {uniqueAssignees.find(a => a.id === assigneeId)?.name}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedAssignees(selectedAssignees.filter(a => a !== assigneeId))}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="w-20">Unit</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredScopeItems.map((item) => {
              const isExpanded = expandedRows.has(item.id)
              return (
                <>
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleRow(item.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-xs py-3">{item.id}</TableCell>
                    <TableCell className="font-medium py-3">{item.title}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium py-3">{item.quantity}</TableCell>
                    <TableCell className="text-sm py-3">{item.unit}</TableCell>
                    <TableCell className="text-right py-3">{formatCurrency(item.unit_cost)}</TableCell>
                    <TableCell className="text-right font-medium py-3">
                      {formatCurrency(item.total_cost)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{item.assigned_to_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50">
                          <Link className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${item.id}-expanded`}>
                      <TableCell colSpan={10} className="bg-gray-50/50 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Project</h4>
                              <p className="text-sm font-medium">{item.project_name}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                              <p className="text-sm">{item.description}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Specification</h4>
                              <p className="text-sm">{item.specification}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Cost Breakdown</h4>
                              <p className="text-sm">
                                <span className="font-medium">{item.quantity} {item.unit}</span> × {formatCurrency(item.unit_cost)} = {formatCurrency(item.total_cost)}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</h4>
                              <p className="text-sm">{item.notes || 'No additional notes'}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}