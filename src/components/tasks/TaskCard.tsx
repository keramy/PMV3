'use client'

/**
 * Task Card Component
 * Individual task display with quick actions
 */

import { useState } from 'react'
import { 
  Calendar, 
  MessageSquare, 
  User, 
  MoreVertical,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  Circle,
  Paperclip
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useQuickStatusUpdate, useDeleteTask } from '@/hooks/useTasks'
import { usePermissions } from '@/hooks/usePermissions'
import { TaskDetail } from './TaskDetail'
import type { Task, TaskStatus, TaskPriority } from '@/types/tasks'
import { formatDistanceToNow, isOverdue as checkOverdue } from '@/lib/formatting'
import { constructionStyles } from '@/lib/styling/construction-styles'
import type { Priority } from '@/types/shared'

interface TaskCardProps {
  task: Task
}

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  not_started: <Circle className="h-4 w-4" />,
  in_progress: <Clock className="h-4 w-4" />,
  on_hold: <AlertCircle className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  cancelled: <Circle className="h-4 w-4 text-red-500" />
}

export function TaskCard({ task }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const updateStatus = useQuickStatusUpdate()
  const deleteTask = useDeleteTask()
  const { hasPermission } = usePermissions()

  const handleStatusChange = (status: TaskStatus) => {
    updateStatus.mutate({ taskId: task.id, status })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(task.id)
    }
  }

  const isOverdue = checkOverdue(task.due_date, task.status)

  return (
    <>
      <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className={cn('mt-1', constructionStyles.priority.getColor(task.priority as Priority))}>
            {statusIcons[task.status as TaskStatus] || <Circle className="h-4 w-4" />}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => setShowDetail(true)}
              >
                {task.title}
                {task.attachments && (task.attachments as any[]).length > 0 && (
                  <span className="inline-flex items-center ml-2 text-xs text-gray-500">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {(task.attachments as any[]).length}
                  </span>
                )}
              </h3>
              
              {/* Actions Dropdown */}
              {hasPermission('assign_tasks') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {hasPermission('complete_tasks') && (
                      <>
                        <DropdownMenuItem onClick={() => handleStatusChange('not_started')}>
                          Mark as Not Started
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('on_hold')}>
                          Mark as On Hold
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
                          Mark as Cancelled
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {hasPermission('assign_tasks') && (
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-red-600"
                      >
                        Delete Task
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Description Preview */}
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              {/* Status Badge */}
              <Badge className={cn('gap-1', constructionStyles.status.getColor(task.status))}>
                {task.status.replace(/_/g, ' ')}
              </Badge>

              {/* Priority */}
              <Badge {...constructionStyles.priority.getBadgeProps(task.priority as Priority, 'font-medium')} />

              {/* Assignee */}
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.first_name?.[0]}
                      {task.assignee.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[100px]">
                    {task.assignee.first_name} {task.assignee.last_name}
                  </span>
                </div>
              )}

              {/* Due Date */}
              {task.due_date && (
                <div className={cn(
                  'flex items-center gap-1',
                  isOverdue && 'text-red-600 font-medium'
                )}>
                  <Calendar className="h-4 w-4" />
                  {isOverdue ? 'Overdue' : formatDistanceToNow(task.due_date)}
                </div>
              )}

              {/* Comments */}
              {task.comment_count !== undefined && task.comment_count > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {task.comment_count}
                </div>
              )}

              {/* Progress */}
              {(task.progress_percentage || 0) > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${task.progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-xs">{task.progress_percentage}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {showDetail && (
        <TaskDetail
          taskId={task.id}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  )
}