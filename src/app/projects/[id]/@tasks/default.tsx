/**
 * Project Tasks Parallel Route - Default Component 
 * Shows project tasks and their status
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function TasksDefault() {
  const tasks = [
    {
      id: 1,
      title: "Review structural drawings",
      description: "Review and approve Phase 1 structural steel drawings",
      assignee: "John Smith",
      dueDate: "2024-01-26",
      priority: "high",
      status: "in_progress",
      completed: false
    },
    {
      id: 2,
      title: "Schedule concrete pour",
      description: "Coordinate with concrete supplier for foundation pour",
      assignee: "Mike Johnson", 
      dueDate: "2024-01-28",
      priority: "medium",
      status: "not_started",
      completed: false
    },
    {
      id: 3,
      title: "Update project timeline",
      description: "Update Gantt chart with latest progress",
      assignee: "Sarah Davis",
      dueDate: "2024-01-24",
      priority: "low",
      status: "completed",
      completed: true
    }
  ]

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    }
    return colors[priority as keyof typeof colors]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      blocked: "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors]
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Tasks</h3>
          <p className="text-sm text-muted-foreground">Project tasks and assignments</p>
        </div>
        <Button>Add Task</Button>
      </div>
      
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={task.completed ? "opacity-75" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={task.completed}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className={`text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {task.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Assigned to: {task.assignee}
                  </span>
                  <span className="text-muted-foreground">
                    Due: {task.dueDate}
                  </span>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}