'use client'

/**
 * Task Detail Component
 * Full task view with comments section
 */

import { useState } from 'react'
import { 
  X, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Tag,
  Paperclip,
  MessageSquare
} from 'lucide-react'
import { formatDate, formatDateTime, isOverdue as checkOverdue } from '@/lib/formatting'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useTask, useDeleteTask } from '@/hooks/useTasks'
import { useTaskDetailRealtime } from '@/hooks/useTaskRealtime'
import { TaskForm } from './TaskForm'
import { CommentSection } from './CommentSection'
import { LoadingSpinner } from '@/components/ui/loading-states'
import type { TaskStatus, TaskPriority } from '@/types/tasks'
import { constructionStyles } from '@/lib/styling/construction-styles'
import type { Priority } from '@/types/shared'
import { cn } from '@/lib/utils'

interface TaskDetailProps {
  taskId: string
  onClose: () => void
}

export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { data: task, isLoading } = useTask(taskId)
  const deleteTask = useDeleteTask()

  // Enable real-time updates for this task
  useTaskDetailRealtime(taskId)

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(taskId)
      onClose()
    }
  }

  if (isEditing && task) {
    return (
      <TaskForm
        projectId={task.project_id || ''}
        task={task}
        onClose={() => setIsEditing(false)}
      />
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl">Task Details</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                disabled={!task}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={!task}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : !task ? (
          <div className="text-center py-8 text-gray-500">
            Task not found
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Task Header */}
            <div className="space-y-4 pb-4 border-b">
              <h2 className="text-2xl font-semibold">{task.title}</h2>
              
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-2">
                <Badge className={cn(constructionStyles.status.getColor(task.status))}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge {...constructionStyles.priority.getBadgeProps(task.priority as Priority)} />
                {task.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/* Assignee */}
                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Assigned to:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.first_name?.[0]}
                          {task.assignee.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {task.assignee.first_name} {task.assignee.last_name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Due Date */}
                {task.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Due date:</span>
                    <span className={cn(
                      "font-medium",
                      checkOverdue(task.due_date, task.status)
                        ? 'text-red-600'
                        : ''
                    )}>
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                )}

                {/* Project */}
                {task.project && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Project:</span>
                    <span className="font-medium">
                      {task.project.code} - {task.project.name}
                    </span>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDate(task.created_at)}</span>
                </div>
              </div>

              {/* Progress */}
              {(task.progress_percentage || 0) > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{task.progress_percentage}%</span>
                  </div>
                  <Progress value={task.progress_percentage} className="h-2" />
                </div>
              )}
            </div>

            {/* Tabs for Description, Comments, Attachments */}
            <Tabs defaultValue="description" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Comments {task.comment_count ? `(${task.comment_count})` : ''}
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex items-center gap-1">
                  <Paperclip className="h-4 w-4" />
                  Files {(task.attachments as any[])?.length ? `(${(task.attachments as any[]).length})` : ''}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <div className="prose max-w-none">
                  {task.description ? (
                    <p className="whitespace-pre-wrap">{task.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <CommentSection taskId={taskId} projectId={task.project_id || ''} />
              </TabsContent>

              <TabsContent value="attachments" className="mt-4">
                {(task.attachments as any[]) && (task.attachments as any[]).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(task.attachments as any[]).map((file: any) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Paperclip className="h-5 w-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No attachments</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}