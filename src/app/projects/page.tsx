'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Filter,
  Calendar,
  DollarSign,
  Building2,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { EmptyProjects } from '@/components/ui/empty-state'
import { ProjectCreateDialog } from '@/components/projects/ProjectCreateDialog'

export default function ProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Check for create query parameter
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateDialogOpen(true)
      // Remove the query parameter
      router.replace('/projects')
    }
  }, [searchParams, router])

  // Fetch projects from API
  const { data: projectsResponse, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      params.append('sort', 'updated_at:desc')
      
      return fetch(`/api/projects?${params}`, {
        headers: { 'x-user-id': profile?.id || '' }
      }).then(res => res.json())
    },
    enabled: !!profile?.id,
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const allProjects = projectsResponse?.projects || []

  // Utility functions
  const getStatusBadge = (status: string) => {
    const config = {
      in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      active: { label: 'Active', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
      planning: { label: 'Planning', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      on_hold: { label: 'On Hold', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
    
    const cfg = config[status as keyof typeof config]
    // Handle undefined status gracefully
    if (!cfg) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">
          {status || 'Unknown'}
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return `₺${(amount / 1000000).toFixed(2)}M`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDaysUntilDeadline = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, className: 'text-red-600' }
    if (days === 0) return { text: 'Due today', className: 'text-orange-600' }
    if (days === 1) return { text: '1 day left', className: 'text-orange-600' }
    if (days <= 7) return { text: `${days} days left`, className: 'text-orange-600' }
    return { text: `${days} days left`, className: 'text-gray-600' }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3" />
    return sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
  }

  // Filter and sort projects
  const filteredAndSortedProjects = allProjects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (!sortField) return 0
      
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]
      
      if (sortField === 'budget' || sortField === 'spent' || sortField === 'progress_percentage') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }
      
      if (sortField === 'start_date' || sortField === 'end_date') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleCreateProject = () => {
    setIsCreateDialogOpen(true)
  }

  const handleProjectCreated = (project: any) => {
    // Refresh the page to show new project
    window.location.reload()
  }

  return (
    <div className="space-y-6 bg-gray-100 min-h-full -m-6 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">
              Manage your construction projects from start to finish
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateProject}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allProjects.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {allProjects.filter(p => p.status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₺{(allProjects.reduce((sum, p) => sum + p.budget, 0) / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">Across all projects</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(allProjects.reduce((sum, p) => sum + p.progress_percentage, 0) / allProjects.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Overall completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white border border-gray-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects or clients..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle>All Projects ({filteredAndSortedProjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('name')}
                      >
                        Project Name
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('client')}
                      >
                        Client
                        {getSortIcon('client')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('budget')}
                      >
                        Budget
                        {getSortIcon('budget')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('spent')}
                      >
                        Spent
                        {getSortIcon('spent')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('end_date')}
                      >
                        Deadline
                        {getSortIcon('end_date')}
                      </Button>
                    </TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort('progress_percentage')}
                      >
                        Progress
                        {getSortIcon('progress_percentage')}
                      </Button>
                    </TableHead>
                    <TableHead>PM</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProjects.map((project) => {
                    const dueInfo = getDaysUntilDeadline(project.end_date)
                    return (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-medium text-left hover:bg-transparent text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={() => handleProjectClick(project.id)}
                          >
                            {project.name}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">{project.client}</TableCell>
                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(project.budget)}</TableCell>
                        <TableCell className="text-sm">
                          <span className={project.spent > project.budget * 0.9 ? 'text-red-600 font-medium' : ''}>
                            {formatCurrency(project.spent)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(project.end_date)}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${dueInfo.className}`}>
                            {dueInfo.text}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress_percentage} className="w-16" />
                            <span className="text-xs text-muted-foreground min-w-[35px]">
                              {project.progress_percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{project.project_manager}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleProjectClick(project.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              {/* Loading State */}
              {projectsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading projects...</p>
                  </div>
                </div>
              )}
              
              {/* Error State */}
              {projectsError && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">Failed to load projects</p>
                    <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
                  </div>
                </div>
              )}
              
              {/* Empty State */}
              {!projectsLoading && !projectsError && filteredAndSortedProjects.length === 0 && (
                <EmptyProjects onCreateProject={handleCreateProject} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Create Dialog */}
      <ProjectCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}