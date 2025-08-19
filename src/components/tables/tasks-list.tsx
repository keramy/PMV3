'use client'

import { useQuery } from '@tanstack/react-query'
import type { Task } from '@/types/tasks'
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

interface TasksListProps {
  projectId?: string
}

export function TasksList({ projectId }: TasksListProps) {
  // API integration with real data fetching
  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetch(`/api/tasks?project_id=${projectId || 'all'}`)
      .then(res => res.json()),
    enabled: true // Always enabled now
  })

  const tasks = tasksData?.data || []

  if (isLoading) return <div className="p-6"><div className="animate-pulse text-center">Loading tasks...</div></div>
  if (error) return <div className="p-6 text-red-600">Error loading tasks</div>

  // No fallback data - use proper API data only

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
      not_started: { 
        label: 'Not Started', 
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
      on_hold: { 
        label: 'On Hold', 
        variant: 'modern_warning' as const,
        icon: <Clock className="mr-1 h-3 w-3" />
      },
      cancelled: { 
        label: 'Cancelled', 
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
      not_started: tasks.filter((t: Task) => t.status === 'not_started'),
      in_progress: tasks.filter((t: Task) => t.status === 'in_progress'),
      completed: tasks.filter((t: Task) => t.status === 'completed'),
      on_hold: tasks.filter((t: Task) => t.status === 'on_hold'),
      cancelled: tasks.filter((t: Task) => t.status === 'cancelled'),
      // Calculate overdue tasks from due_date
      overdue: tasks.filter((t: Task) => {
        if (!t.due_date) return false
        const dueDate = new Date(t.due_date)
        const now = new Date()
        return dueDate < now && t.status !== 'completed'
      })
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
                <span className="text-gray-800">Not Started:</span>
                <span className="font-bold text-gray-800">{tasksByStatus.not_started.length}</span>
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
              High Priority ({tasks.filter((t: Task) => t.priority === 'critical' || t.priority === 'high').length})
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Not Started Column */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-gray-200 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-800" />
                <h3 className="font-bold text-gray-900">Not Started</h3>
              </div>
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-400">
                {tasksByStatus.not_started.length}
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {tasksByStatus.not_started.map((task: Task) => (
              <Card key={task.id} className="border-l-4 border-l-gray-400 hover:shadow-md hover:bg-gray-200 transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <Checkbox checked={task.status === 'completed'} className="mt-1" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-800 mb-2">{task.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{task.project?.name || 'No Project'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-gray-200">
                            {task.assignee ? `${task.assignee.first_name?.[0] || ''}${task.assignee.last_name?.[0] || ''}` : 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800">{task.assignee?.first_name || 'Unassigned'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Calendar className="h-3 w-3" />
                          <span>{task.due_date ? getDaysUntilDue(task.due_date) : 'No due date'}</span>
                        </div>
                        {(task.comment_count || 0) > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comment_count}</span>
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
            {tasksByStatus.in_progress.map((task: Task) => (
              <Card key={task.id} className="border-l-4 border-l-blue-400 hover:shadow-md hover:bg-gray-200 transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <Checkbox checked={task.status === 'completed'} className="mt-1" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-800 mb-2">{task.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{task.project?.name || 'No Project'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-blue-100">
                            {task.assignee ? `${task.assignee.first_name?.[0] || ''}${task.assignee.last_name?.[0] || ''}` : 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800">{task.assignee?.first_name || 'Unassigned'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Calendar className="h-3 w-3" />
                          <span>{task.due_date ? getDaysUntilDue(task.due_date) : 'No due date'}</span>
                        </div>
                        {(task.comment_count || 0) > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comment_count}</span>
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
            {tasksByStatus.overdue.map((task: Task) => (
              <Card key={task.id} className="border-l-4 border-l-red-400 hover:shadow-md transition-shadow bg-red-50/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <Checkbox checked={task.status === 'completed'} className="mt-1" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-800 mb-2">{task.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{task.project?.name || 'No Project'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-red-100">
                            {task.assignee ? `${task.assignee.first_name?.[0] || ''}${task.assignee.last_name?.[0] || ''}` : 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800">{task.assignee?.first_name || 'Unassigned'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                          <Calendar className="h-3 w-3" />
                          <span>{task.due_date ? getDaysUntilDue(task.due_date) : 'No due date'}</span>
                        </div>
                        {(task.comment_count || 0) > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comment_count}</span>
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
            {tasksByStatus.completed.map((task: Task) => (
              <Card key={task.id} className="border-l-4 border-l-green-400 hover:shadow-md hover:bg-gray-200 transition-shadow opacity-75">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                      <Checkbox checked={task.status === 'completed'} className="mt-1" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 line-through">{task.title}</h4>
                      <p className="text-xs text-gray-800 mb-2">{task.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{task.project?.name || 'No Project'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-green-100">
                            {task.assignee ? `${task.assignee.first_name?.[0] || ''}${task.assignee.last_name?.[0] || ''}` : 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-800">{task.assignee?.first_name || 'Unassigned'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="h-3 w-3" />
                          <span>Done</span>
                        </div>
                        {(task.comment_count || 0) > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comment_count}</span>
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