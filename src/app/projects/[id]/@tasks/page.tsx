/**
 * Tasks Overview Parallel Route  
 * Shows task summary and quick links in project workspace
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TasksSkeleton } from '@/components/ui/loading-states'
import { ListTodo, ArrowRight, Plus, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface TasksOverviewProps {
  projectId: string
}

async function getTaskStats(projectId: string) {
  // Mock data for now - in real app this would call our API
  return {
    total: 12,
    by_status: {
      todo: 4,
      in_progress: 3,
      review: 2,
      completed: 3
    },
    by_priority: {
      normal: 7,
      high: 4,
      urgent: 1
    },
    overdue: 2,
    due_today: 1,
    assigned_to_me: 5,
    completion_rate: 25
  }
}

async function TasksOverviewContent({ projectId }: TasksOverviewProps) {
  const stats = await getTaskStats(projectId)
  const activeTasks = stats.total - stats.by_status.completed

  return (
    <Card className="construction-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center space-x-2">
            <ListTodo className="h-4 w-4" />
            <span>Task Management</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {activeTasks} active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Task Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-900">{stats.by_status.in_progress}</div>
            <div className="text-xs text-blue-700 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              In Progress
            </div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-900">{stats.by_status.review}</div>
            <div className="text-xs text-yellow-700 flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              In Review
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-900">{stats.overdue}</div>
            <div className="text-xs text-red-700">Overdue</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-900">{stats.completion_rate}%</div>
            <div className="text-xs text-green-700 flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Complete
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Priority Breakdown</h4>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">● Urgent</span>
              <Badge variant="outline" className="text-red-600">{stats.by_priority.urgent}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-600">● High</span>
              <Badge variant="outline" className="text-orange-600">{stats.by_priority.high}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">● Normal</span>
              <Badge variant="outline" className="text-gray-600">{stats.by_priority.normal}</Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Link href={`/projects/${projectId}/tasks`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                View All Tasks
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <Link href={`/projects/${projectId}/tasks`}>
              <Button size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </Link>
          </div>
        </div>

        {/* Personal Stats */}
        {stats.assigned_to_me > 0 && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 font-medium">
              {stats.assigned_to_me} tasks assigned to you
            </div>
            {stats.due_today > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                {stats.due_today} due today
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PageProps {
  params: {
    id: string
  }
}

export default function TasksOverviewPage({ params }: PageProps) {
  return (
    <Suspense fallback={<TasksSkeleton count={1} />}>
      <TasksOverviewContent projectId={params.id} />
    </Suspense>
  )
}