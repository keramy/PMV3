'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
  Building2,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause
} from 'lucide-react'

export function ProjectsTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Mock projects data with team members
  const allProjects = [
    {
      id: 'proj-001',
      name: 'Akbank Head Office Renovation',
      client: 'Akbank',
      status: 'in_progress',
      budget: 2800000,
      spent: 1820000,
      start_date: '2025-01-15',
      end_date: '2025-06-30',
      progress_percentage: 65,
      team: [
        { name: 'Mehmet Yılmaz', role: 'Project Manager', initials: 'MY' },
        { name: 'Ahmet Kocabaş', role: 'Site Supervisor', initials: 'AK' },
        { name: 'Elif Özkan', role: 'Electrical Engineer', initials: 'EÖ' }
      ]
    },
    {
      id: 'proj-002', 
      name: 'Garanti BBVA Tech Center MEP',
      client: 'Garanti BBVA',
      status: 'in_progress',
      budget: 4200000,
      spent: 1890000,
      start_date: '2024-11-01',
      end_date: '2025-08-15',
      progress_percentage: 45,
      team: [
        { name: 'Ayşe Demir', role: 'Project Manager', initials: 'AD' },
        { name: 'Baran Yurt', role: 'MEP Engineer', initials: 'BY' },
        { name: 'Ceren Aydın', role: 'Quality Control', initials: 'CA' },
        { name: 'Deniz Kaya', role: 'Site Coordinator', initials: 'DK' }
      ]
    },
    {
      id: 'proj-003',
      name: 'Marina Bay Tower Construction',
      client: 'Marina Development',
      status: 'planning',
      budget: 8500000,
      spent: 0,
      start_date: '2025-03-01',
      end_date: '2026-01-15',
      progress_percentage: 15,
      team: [
        { name: 'Can Özkan', role: 'Project Manager', initials: 'CÖ' },
        { name: 'Fatma Güler', role: 'Structural Engineer', initials: 'FG' }
      ]
    },
    {
      id: 'proj-004',
      name: 'Tech Hub Renovation Phase 2',
      client: 'Tech Hub Istanbul',
      status: 'completed',
      budget: 1250000,
      spent: 1225000,
      start_date: '2024-08-01',
      end_date: '2024-12-20',
      progress_percentage: 100,
      team: [
        { name: 'Zeynep Kaya', role: 'Project Manager', initials: 'ZK' },
        { name: 'Gökhan Yurt', role: 'Interior Designer', initials: 'GY' }
      ]
    },
    {
      id: 'proj-005',
      name: 'Sabanci Center Office Fit-out',
      client: 'Sabanci Holding',
      status: 'on_hold',
      budget: 950000,
      spent: 285000,
      start_date: '2025-02-01',
      end_date: '2025-07-10',
      progress_percentage: 30,
      team: [
        { name: 'Emre Şahin', role: 'Project Manager', initials: 'EŞ' },
        { name: 'Hande Demir', role: 'Architect', initials: 'HD' },
        { name: 'İbrahim Çelik', role: 'Contractor', initials: 'İÇ' }
      ]
    },
    {
      id: 'proj-006',
      name: 'Formula HQ Showroom',
      client: 'Formula PM',
      status: 'in_progress',
      budget: 680000,
      spent: 510000,
      start_date: '2025-01-10',
      end_date: '2025-04-25',
      progress_percentage: 75,
      team: [
        { name: 'Selin Aydın', role: 'Project Manager', initials: 'SA' },
        { name: 'Kaan Özdemir', role: 'Designer', initials: 'KÖ' }
      ]
    },
    {
      id: 'proj-007',
      name: 'Yapı Kredi Bank Branch Network',
      client: 'Yapı Kredi',
      status: 'planning',
      budget: 3200000,
      spent: 0,
      start_date: '2025-04-01',
      end_date: '2025-11-30',
      progress_percentage: 8,
      team: [
        { name: 'Burak Yıldız', role: 'Project Manager', initials: 'BY' },
        { name: 'Lale Güneş', role: 'Financial Analyst', initials: 'LG' },
        { name: 'Mert Kocaman', role: 'Site Manager', initials: 'MK' }
      ]
    },
    {
      id: 'proj-008',
      name: 'Zorlu Center Retail Expansion',
      client: 'Zorlu Holding',
      status: 'in_progress',
      budget: 5600000,
      spent: 2240000,
      start_date: '2024-10-15',
      end_date: '2025-05-20',
      progress_percentage: 40,
      team: [
        { name: 'Derya Arslan', role: 'Project Manager', initials: 'DA' },
        { name: 'Nejat Yıldırım', role: 'Construction Lead', initials: 'NY' },
        { name: 'Onur Kaplan', role: 'Safety Officer', initials: 'OK' }
      ]
    },
    {
      id: 'proj-009',
      name: 'Koç University Lab Building',
      client: 'Koç University',
      status: 'in_progress',
      budget: 7200000,
      spent: 3600000,
      start_date: '2024-09-01',
      end_date: '2025-12-15',
      progress_percentage: 50,
      team: [
        { name: 'Kerem Özdemir', role: 'Project Manager', initials: 'KÖ' },
        { name: 'Pınar Yılmaz', role: 'Lab Specialist', initials: 'PY' },
        { name: 'Rıza Tekin', role: 'HVAC Engineer', initials: 'RT' },
        { name: 'Sibel Acar', role: 'Coordinator', initials: 'SA' }
      ]
    },
    {
      id: 'proj-010',
      name: 'Turkcell Data Center Cooling',
      client: 'Turkcell',
      status: 'completed',
      budget: 2100000,
      spent: 2050000,
      start_date: '2024-06-01',
      end_date: '2024-11-30',
      progress_percentage: 100,
      team: [
        { name: 'Gül Yılmaz', role: 'Project Manager', initials: 'GY' },
        { name: 'Tarık Koç', role: 'Cooling Systems Engineer', initials: 'TK' }
      ]
    }
  ]

  // Utility functions
  const getStatusBadge = (status: string) => {
    const config = {
      in_progress: { 
        label: 'In Progress', 
        variant: 'modern_info' as const,
        icon: <Clock className="w-3 h-3 mr-1" />
      },
      completed: { 
        label: 'Completed', 
        variant: 'modern_success' as const,
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      planning: { 
        label: 'Planning', 
        variant: 'modern_warning' as const,
        icon: <AlertTriangle className="w-3 h-3 mr-1" />
      },
      on_hold: { 
        label: 'On Hold', 
        variant: 'modern_neutral' as const,
        icon: <Pause className="w-3 h-3 mr-1" />
      }
    }
    
    const cfg = config[status as keyof typeof config]
    return (
      <Badge variant={cfg.variant}>
        {cfg.icon}
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

  const getTeamAvatars = (team: Array<{ name: string; role: string; initials: string }>) => {
    const maxVisible = 3
    const visibleTeam = team.slice(0, maxVisible)
    const remainingCount = team.length - maxVisible

    return (
      <div className="flex items-center -space-x-2">
        {visibleTeam.map((member, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="bg-gray-200 text-gray-800 text-xs font-medium">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {team.slice(maxVisible).map((member, index) => (
                  <div key={index} className="text-center">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    )
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
    return { text: `${days} days left`, className: 'text-gray-800' }
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
    router.push(`/ui-preview/projects/${projectId}`)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">Manage your construction projects from start to finish</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

      {/* Filters and Search */}
      <Card className="bg-white border border-gray-400 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-80">
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
      <Card className="bg-white border border-gray-400 shadow-md">
        <CardHeader>
          <CardTitle>All Projects ({filteredAndSortedProjects.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="py-4 font-semibold text-gray-800">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-800 hover:text-gray-900"
                      onClick={() => handleSort('name')}
                    >
                      Project Name
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-800">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-800 hover:text-gray-900"
                      onClick={() => handleSort('client')}
                    >
                      Client
                      {getSortIcon('client')}
                    </Button>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-800">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-800 hover:text-gray-900"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-800">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-800 hover:text-gray-900"
                      onClick={() => handleSort('end_date')}
                    >
                      Deadline
                      {getSortIcon('end_date')}
                    </Button>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-800">Duration</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-800">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-800 hover:text-gray-900"
                      onClick={() => handleSort('progress_percentage')}
                    >
                      Progress
                      {getSortIcon('progress_percentage')}
                    </Button>
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-800">Team</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProjects.map((project) => {
                  const dueInfo = getDaysUntilDeadline(project.end_date)
                  return (
                    <TableRow key={project.id} className="hover:bg-gray-100/50">
                      <TableCell className="py-4">
                        <Button
                          variant="ghost"
                          className="h-auto p-0 font-medium text-left hover:bg-transparent text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => handleProjectClick(project.id)}
                        >
                          {project.name}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-gray-800 py-4">{project.client}</TableCell>
                      <TableCell className="py-4">{getStatusBadge(project.status)}</TableCell>
                      <TableCell className="text-sm text-gray-800 py-4">{formatDate(project.end_date)}</TableCell>
                      <TableCell className="py-4">
                        <span className={`text-sm font-medium ${dueInfo.className}`}>
                          {dueInfo.text}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Progress value={project.progress_percentage} className="w-20" />
                          <span className="text-xs text-muted-foreground font-medium min-w-[38px]">
                            {project.progress_percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">{getTeamAvatars(project.team)}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleProjectClick(project.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              </Table>
            {filteredAndSortedProjects.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-sm text-gray-700">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  )
}