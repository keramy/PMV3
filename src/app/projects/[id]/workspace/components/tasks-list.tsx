'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search,
  Plus,
  Calendar,
  MessageSquare,
  Flag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CheckCircle,
  Timer
} from 'lucide-react'

export function TasksList() {
  // Tasks data
  const tasks = [
    {
      id: 'T-001',
      title: 'Conference Room Technology Integration',
      description: 'Install and configure AV equipment in executive conference room',
      project: 'Akbank Head Office Renovation',
      assignee: 'Ebru Alkin',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2025-06-15',
      comments: 3,
      completed: false
    },
    {
      id: 'T-002',
      title: 'Office Furniture Coordination',
      description: 'Coordinate delivery and installation of office furniture',
      project: 'Tech Hub Renovation',
      assignee: 'Serra Uluveren',
      priority: 'medium',
      status: 'pending',
      dueDate: '2025-06-18',
      comments: 1,
      completed: false
    },
    {
      id: 'T-003',
      title: 'Showroom Display System Setup',
      description: 'Install interactive display systems in showroom area',
      project: 'Formula HQ Showroom',
      assignee: 'Hakan Ayseli',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2025-06-12',
      comments: 5,
      completed: false
    },
    {
      id: 'T-004',
      title: 'Formula Branded Reception Wall Design',
      description: 'Complete design and installation of branded wall',
      project: 'Formula HQ Showroom',
      assignee: 'Yusuf Saglam',
      priority: 'low',
      status: 'completed',
      dueDate: '2025-06-10',
      comments: 2,
      completed: true
    },
    {
      id: 'T-005',
      title: 'HVAC System Testing',
      description: 'Complete testing and commissioning of HVAC system',
      project: 'Garanti BBVA Tech Center',
      assignee: 'Emre Koc',
      priority: 'critical',
      status: 'overdue',
      dueDate: '2025-06-08',
      comments: 8,
      completed: false
    },
    {
      id: 'T-006',
      title: 'Electrical Panel Installation',
      description: 'Install main electrical distribution panel',
      project: 'Marina Bay Tower',
      assignee: 'Fatma Arslan',
      priority: 'high',
      status: 'pending',
      dueDate: '2025-06-20',
      comments: 0,
      completed: false
    }
  ]

  const getPriorityBadge = (priority: string) => {
    const config = {
      critical: { 
        label: 'Critical', 
        variant: 'modern_danger' as const,
        icon: <Flag className="mr-1 h-2 w-2" />
      },
      high: { 
        label: 'High', 
        variant: 'modern_warning' as const,
        icon: <Flag className="mr-1 h-2 w-2" />
      },
      medium: { 
        label: 'Medium', 
        variant: 'modern_info' as const,
        icon: <Flag className="mr-1 h-2 w-2" />
      },
      low: { 
        label: 'Low', 
        variant: 'modern_neutral' as const,
        icon: <Flag className="mr-1 h-2 w-2" />
      }
    }
    
    const cfg = config[priority as keyof typeof config]
    return (
      <Badge variant={cfg.variant}>
        {cfg.icon}
        {cfg.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { 
        label: 'To Do', 
        variant: 'modern_neutral' as const,
        icon: <Clock className="mr-1 h-3 w-3" />
      },
      in_progress: { 
        label: 'In Progress', 
        variant: 'modern_info' as const,
        icon: <Timer className="mr-1 h-3 w-3" />
      },
      completed: { 
        label: 'Completed', 
        variant: 'modern_success' as const,
        icon: <CheckCircle className="mr-1 h-3 w-3" />
      },
      overdue: { 
        label: 'Overdue', 
        variant: 'modern_danger' as const,
        icon: <AlertTriangle className="mr-1 h-3 w-3" />
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

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diff = due.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `Due in ${days} days`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">Manage project tasks and assignments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
        <Button variant="outline">All Priorities</Button>
        <Button variant="outline">All Status</Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={task.completed}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </h3>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                      <p className="text-xs text-muted-foreground">Project: {task.project}</p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assignee}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{getDaysUntilDue(task.dueDate)}</span>
                      </div>
                      
                      {task.comments > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{task.comments}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}