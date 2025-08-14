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

  const getTasksByStatus = () => {
    return {
      pending: tasks.filter(t => t.status === 'pending'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      completed: tasks.filter(t => t.status === 'completed'),
      overdue: tasks.filter(t => t.status === 'overdue')
    }
  }

  const tasksByStatus = getTasksByStatus()

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-r from-gray-100 to-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
              Project Tasks
            </h2>
            <p className="text-sm text-gray-800 mt-1">Visual kanban board with priority tracking</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                <span className="text-gray-800">To Do:</span>
                <span className="font-bold text-gray-800">{tasksByStatus.pending.length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-800">In Progress:</span>
                <span className="font-bold text-blue-700">{tasksByStatus.in_progress.length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-800">Overdue:</span>
                <span className="font-bold text-red-700">{tasksByStatus.overdue.length}</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-800">Completed:</span>
                <span className="font-bold text-green-700">{tasksByStatus.completed.length}</span>
              </span>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-auto font-medium shadow-sm">
            <Plus className="mr-2 h-5 w-5" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
            <Input
              placeholder="Search tasks by title, assignee, or project..."
              className="pl-12 h-12 text-base border-2 border-gray-400 focus:border-blue-500 rounded-lg"
            />
          </div>
          
          {/* Quick Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="h-12 px-4 border-2 hover:bg-red-50 hover:border-red-300">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
              Overdue ({tasksByStatus.overdue.length})
            </Button>
            <Button variant="outline" className="h-12 px-4 border-2 hover:bg-orange-50 hover:border-orange-300">
              <Flag className="h-4 w-4 mr-2 text-orange-600" />
              High Priority ({tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length})
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* To Do Column */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-gray-200 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-800" />
                <h3 className="font-bold text-gray-900">To Do</h3>
              </div>
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">
                {tasksByStatus.pending.length}
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {tasksByStatus.pending.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-gray-400 hover:shadow-md hover:bg-gray-200 transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <Checkbox checked={task.completed} className="mt-1" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-800 mb-2">{task.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{task.project}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-gray-200">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800">{task.assignee.split(' ')[0]}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Calendar className="h-3 w-3" />
                          <span>{getDaysUntilDue(task.dueDate)}</span>
                        </div>
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-blue-100 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-blue-800">In Progress</h3>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                {tasksByStatus.in_progress.length}
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {tasksByStatus.in_progress.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-blue-400 hover:shadow-md hover:bg-gray-200 transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <Checkbox checked={task.completed} className="mt-1" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-800 mb-2">{task.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{task.project}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-blue-100">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800">{task.assignee.split(' ')[0]}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Calendar className="h-3 w-3" />
                          <span>{getDaysUntilDue(task.dueDate)}</span>
                        </div>
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Overdue Column */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-red-100 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-red-800">Overdue</h3>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                {tasksByStatus.overdue.length}
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {tasksByStatus.overdue.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-red-400 hover:shadow-md transition-shadow bg-red-50/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <Checkbox checked={task.completed} className="mt-1" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-800 mb-2">{task.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{task.project}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-red-100">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800">{task.assignee.split(' ')[0]}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                          <Calendar className="h-3 w-3" />
                          <span>{getDaysUntilDue(task.dueDate)}</span>
                        </div>
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-green-100 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-green-800">Completed</h3>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                {tasksByStatus.completed.length}
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {tasksByStatus.completed.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-green-400 hover:shadow-md hover:bg-gray-200 transition-shadow opacity-75">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <Checkbox checked={task.completed} className="mt-1" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 line-through">{task.title}</h4>
                      <p className="text-xs text-gray-800 mb-2">{task.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{task.project}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-green-100">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800">{task.assignee.split(' ')[0]}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="h-3 w-3" />
                          <span>Done</span>
                        </div>
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}