'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const router = useRouter()

  // KPI data matching screenshot design
  const kpiCards = [
    {
      title: 'Total Portfolio Value',
      value: '₺10.8M',
      description: 'Total project budgets',
      change: '7 projects',
      icon: TurkishLiraIcon,
      color: 'bg-orange-100 text-orange-700',
      trend: 'up'
    },
    {
      title: 'Active Project Value',
      value: '₺4.5M',
      description: 'Currently in progress',
      change: '4 active',
      icon: TurkishLiraIcon,
      color: 'bg-blue-100 text-blue-700',
      trend: 'up'
    },
    {
      title: 'Task Completion',
      value: '30%',
      description: 'Tasks completed',
      change: '11/37',
      icon: CheckCircle,
      color: 'bg-purple-100 text-purple-700',
      trend: 'down'
    },
    {
      title: 'Overall Progress',
      value: '30%',
      description: 'Project completion rate',
      change: '14% completed',
      icon: Activity,
      color: 'bg-gray-100 text-gray-700',
      trend: 'up'
    }
  ]

  // Recent activity data
  const recentActivity = [
    {
      user: 'Yusuf Saglam',
      action: 'approved shop drawing',
      item: 'Electrical_Panel_L2.pdf',
      project: 'Marina Bay Tower',
      time: '2 minutes ago',
      type: 'shop-drawing'
    },
    {
      user: 'Sarah Kim',
      action: 'completed task',
      item: 'Install temporary power',
      project: 'Tech Hub Renovation',
      time: '15 minutes ago',
      type: 'task'
    },
    {
      user: 'David Johnson',
      action: 'approved material spec',
      item: 'HVAC Units - Mitsubishi VRF',
      project: 'Garanti BBVA Tech Center',
      time: '1 hour ago',
      type: 'material'
    },
    {
      user: 'Hakan Ayseli',
      action: 'uploaded drawing',
      item: 'Fire_Suppression_Rev_A.pdf',
      project: 'Sabanci Center',
      time: '2 hours ago',
      type: 'shop-drawing'
    }
  ]

  // Critical tasks
  const criticalTasks = [
    {
      title: 'Electrical Panel Review',
      project: 'Marina Bay Tower',
      daysOverdue: 3,
      priority: 'high'
    },
    {
      title: 'HVAC System Approval',
      project: 'Tech Hub Renovation',
      daysOverdue: 1,
      priority: 'medium'
    },
    {
      title: 'Fire Suppression Drawing',
      project: 'Garanti BBVA Tech Center',
      daysOverdue: 5,
      priority: 'critical'
    }
  ]

  // Projects data - using Turkish construction projects
  const projects = [
    {
      id: 'proj-001',
      name: 'Akbank Head Office Renovation',
      status: 'in_progress',
      budget: 2800000,
      start_date: '2025-01-15',
      end_date: '2025-06-30',
      progress_percentage: 65
    },
    {
      id: 'proj-002', 
      name: 'Garanti BBVA Tech Center MEP',
      status: 'in_progress',
      budget: 4200000,
      start_date: '2024-11-01',
      end_date: '2025-08-15',
      progress_percentage: 45
    },
    {
      id: 'proj-003',
      name: 'Marina Bay Tower Construction',
      status: 'planning',
      budget: 8500000,
      start_date: '2025-03-01',
      end_date: '2026-01-15',
      progress_percentage: 15
    },
    {
      id: 'proj-004',
      name: 'Tech Hub Renovation Phase 2',
      status: 'completed',
      budget: 1250000,
      start_date: '2024-08-01',
      end_date: '2024-12-20',
      progress_percentage: 100
    },
    {
      id: 'proj-005',
      name: 'Sabanci Center Office Fit-out',
      status: 'on_hold',
      budget: 950000,
      start_date: '2025-02-01',
      end_date: '2025-07-10',
      progress_percentage: 30
    },
    {
      id: 'proj-006',
      name: 'Formula HQ Showroom',
      status: 'in_progress',
      budget: 680000,
      start_date: '2025-01-10',
      end_date: '2025-04-25',
      progress_percentage: 75
    },
    {
      id: 'proj-007',
      name: 'Yapı Kredi Bank Branch Network',
      status: 'planning',
      budget: 3200000,
      start_date: '2025-04-01',
      end_date: '2025-11-30',
      progress_percentage: 8
    }
  ]

  // Utility functions
  const getStatusBadge = (status: string) => {
    const config = {
      in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
      planning: { label: 'Planning', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      on_hold: { label: 'On Hold', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
    
    const cfg = config[status as keyof typeof config]
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return `₺${(amount / 1000000).toFixed(1)}M`
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
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) {
        // Default sort: in_progress first, then by progress percentage descending
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
        if (b.status === 'in_progress' && a.status !== 'in_progress') return 1
        return b.progress_percentage - a.progress_percentage
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
    // Navigate to UI Preview project workspace
    router.push(`/ui-preview/projects/${projectId}`)
  }

  return (
    <div className="space-y-8 bg-gray-50 min-h-full -m-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's your project overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="relative overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <div className={`rounded-xl p-3 ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                <p className="text-sm text-muted-foreground mb-3">{kpi.description}</p>
                <div className="flex items-center gap-2">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium text-muted-foreground">{kpi.change}</span>
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
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-full">
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
              {/* Condensed Projects List */}
              <div className="space-y-3">
                {filteredAndSortedProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
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
                        <span className="text-xs text-muted-foreground">{formatCurrency(project.budget)}</span>
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
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Middle Column (4/12) */}
        <div className="xl:col-span-4">
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-full">
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
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{activity.item}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{activity.project}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Critical Tasks - Right Column (3/12) */}
        <div className="xl:col-span-3">
          <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-full">
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
              {criticalTasks.map((task, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-tight">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.project}</p>
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
                      {task.priority}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <Clock className="h-3 w-3" />
                      <span>{task.daysOverdue}d</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}