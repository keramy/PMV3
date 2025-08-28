'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  TrendingUp, 
  TrendingDown, 
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import type { Project } from '@/types/database'
import { EmptyProjects, EmptyActivity, EmptyTasks } from '@/components/ui/empty-state'

// Turkish Lira icon component
const TurkishLiraIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M6 6v12l6-2V4l-6 2z" />
    <path d="M4 8h8" />
    <path d="M4 12h8" />
  </svg>
)

// Type definitions for Dashboard components
interface KPICard {
  title: string
  value: string
  description: string
  change: string
  icon: LucideIcon
  color: string
  trend: 'up' | 'down'
}

interface DashboardProject {
  id: string
  name: string
  client: string
  status: string
  progress: number
  value: string
  [key: string]: any // Allow additional properties
}

interface Activity {
  id: string
  user: string
  action: string
  target: string
  time: string
  [key: string]: any // Allow additional properties
}

interface Task {
  id: string
  title: string
  project: string
  priority: string
  due_date: string
  assigned_to: string
  [key: string]: any // Allow additional properties
}

interface DashboardProps {
  user: any
  profile: any
  loading: boolean
}

export function Dashboard({ user, profile, loading }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const router = useRouter()

  // TODO: Replace with real project context
  // const { currentProjectId } = useProject()
  const currentProjectId = 'all' // 'all' for company-wide dashboard

  // API integration with real data fetching
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useQuery({
    queryKey: ['dashboard-metrics', currentProjectId],
    queryFn: () => fetch(`/api/dashboard/metrics?project_id=${currentProjectId}`, {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()),
    enabled: !!profile?.id,
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  })

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity', currentProjectId],
    queryFn: () => fetch(`/api/dashboard/activity?project_id=${currentProjectId}&limit=10`, {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()),
    enabled: !!profile?.id,
    refetchInterval: 30 * 1000 // Refresh every 30 seconds
  })

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['dashboard-projects', currentProjectId],
    queryFn: () => fetch(`/api/projects?status=active&limit=5&sort=updated_at`, {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()),
    enabled: !!profile?.id
  })

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-critical-tasks'],
    queryFn: () => fetch('/api/dashboard/critical-tasks?limit=5', {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()),
    enabled: !!profile?.id
  })

  // Show loading state while auth is loading
  if (loading) {
    return <div className="p-6"><div className="animate-pulse text-center">Loading authentication...</div></div>
  }

  // Show API loading state separately
  if (kpiLoading || activityLoading || projectsLoading || tasksLoading) {
    return <div className="p-6"><div className="animate-pulse text-center">Loading dashboard data...</div></div>
  }

  // Show auth required message if no profile
  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access your dashboard.</p>
          <a 
            href="/login" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  // Use real API data for KPI cards
  const metrics = kpiData || {
    activeProjects: 0,
    completedProjects: 0, 
    totalBudget: 0,
    actualSpend: 0,
    onTimeProjects: 0,
    delayedProjects: 0,
    pendingDrawings: 0,
    approvedDrawings: 0,
    openTasks: 0,
    overdueTasks: 0
  }

  const totalProjects = metrics.activeProjects + metrics.completedProjects
  const completionRate = totalProjects > 0 ? Math.round((metrics.completedProjects / totalProjects) * 100) : 0
  
  const formatCurrency = (amount: number) => {
    if (amount === 0) return '₺0'
    if (amount >= 1000000) return `₺${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `₺${(amount / 1000).toFixed(0)}K`
    return `₺${amount.toLocaleString()}`
  }

  const kpiCards = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(metrics.totalBudget),
      description: 'Total project budgets',
      change: `${totalProjects} projects`,
      icon: TurkishLiraIcon,
      color: 'bg-orange-100 text-orange-700',
      trend: 'up' as const
    },
    {
      title: 'Active Project Value', 
      value: formatCurrency(metrics.actualSpend),
      description: 'Currently in progress',
      change: `${metrics.activeProjects} active`,
      icon: TurkishLiraIcon,
      color: 'bg-blue-100 text-blue-700',
      trend: 'up' as const
    },
    {
      title: 'Task Completion',
      value: metrics.openTasks + metrics.overdueTasks > 0 ? 
        `${Math.round((metrics.openTasks / (metrics.openTasks + metrics.overdueTasks)) * 100)}%` : '0%',
      description: 'Tasks completed',
      change: `${metrics.openTasks} open`,
      icon: CheckCircle,
      color: 'bg-purple-100 text-purple-700',
      trend: metrics.overdueTasks > 0 ? 'down' as const : 'up' as const
    },
    {
      title: 'Overall Progress',
      value: `${completionRate}%`,
      description: 'Project completion rate',
      change: `${metrics.completedProjects} completed`,
      icon: Activity,
      color: 'bg-gray-100 text-gray-800',
      trend: 'up' as const
    }
  ]

  const recentActivity = activityData || []

  const projects = projectsData?.projects || []

  const criticalTasks = tasksData || []

  // Utility functions
  const getStatusBadge = (status: string) => {
    const config = {
      in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      active: { label: 'Active', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
      planning: { label: 'Planning', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      on_hold: { label: 'On Hold', className: 'bg-gray-100 text-gray-800 border-gray-400' }
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


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDaysUntilDeadline = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return '1 day left'
    return `${days} days left`
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
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  // Filter and sort projects - show only top 5 most important
  const filteredAndSortedProjects = projects
    .filter((project: Project) => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Project, b: Project) => {
      if (!sortField) {
        // Default sort: in_progress first, then by progress percentage descending
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
        if (b.status === 'in_progress' && a.status !== 'in_progress') return 1
        return (b.progress_percentage || 0) - (a.progress_percentage || 0)
      }
      
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]
      
      if (sortField === 'budget') {
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
    .slice(0, 5) // Show only top 5 projects

  const handleProjectClick = (projectId: string) => {
    // Navigate to project workspace
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className="space-y-8 bg-gray-100 min-h-full -m-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="relative overflow-hidden bg-white border border-gray-400 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${kpi.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mb-2">{kpi.description}</p>
                <div className="flex items-center gap-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">{kpi.change}</span>
                </div>
              </CardContent>
              {kpi.title !== 'Active Project Value' && (
                <div className={`absolute inset-x-0 top-0 h-2 ${kpi.color.split(' ')[0].replace('100', '500')}`} />
              )}
            </Card>
          )
        })}
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Projects Overview - Left Column (5/12) */}
        <div className="xl:col-span-5">
          <Card className="bg-white border border-gray-400 shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Active projects</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Top priority projects overview</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  View All ({projects.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredAndSortedProjects.length > 0 ? (
                <div className="space-y-3">
                  {filteredAndSortedProjects.map((project: DashboardProject) => (
                    <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-400 hover:bg-gray-200 hover:border-gray-500 transition-all">
                      <div className="flex-1 min-w-0">
                        <Button
                          variant="ghost"
                          className="h-auto p-0 font-medium text-left hover:bg-transparent text-blue-600 hover:text-blue-800 hover:underline text-sm"
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <span className="truncate">{project.name}</span>
                        </Button>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(project.status)}
                          <span className="text-xs text-muted-foreground">{formatCurrency(project.budget || 0)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right">
                          <Progress value={project.progress_percentage} className="w-12 h-2" />
                          <span className="text-xs text-muted-foreground">{project.progress_percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyProjects onCreateProject={() => router.push('/projects?create=true')} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Middle Column (4/12) */}
        <div className="xl:col-span-4">
          <Card className="bg-white border border-gray-400 shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent activity
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {recentActivity.length} new
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity: Activity, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {activity.user?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user || 'Unknown User'}</span>{' '}
                        <span className="text-muted-foreground">{activity.action || 'performed an action'}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{activity.item || 'on an item'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{activity.project || 'Unknown Project'}</span>
                        <span>•</span>
                        <span>{activity.time || 'recently'}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type || 'activity'}
                    </Badge>
                  </div>
                ))
              ) : (
                <EmptyActivity />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Critical Tasks - Right Column (3/12) */}
        <div className="xl:col-span-3">
          <Card className="bg-white border border-gray-400 shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Critical tasks
                <Badge variant="destructive" className="text-xs ml-auto">
                  {criticalTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalTasks.length > 0 ? (
                criticalTasks.map((task: Task, index: number) => (
                  <div key={index} className="space-y-2 rounded-lg border border-gray-400 p-3 hover:bg-gray-200 hover:border-gray-500 transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">{task.title || 'Untitled Task'}</p>
                      <p className="text-xs text-muted-foreground truncate">{task.project || 'Unknown Project'}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={
                          task.priority === 'critical' ? 'destructive' : 
                          task.priority === 'high' ? 'default' : 
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {task.priority || 'normal'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <Clock className="h-3 w-3" />
                        <span>{task.daysOverdue || 0}d</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyTasks />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}