'use client'

/**
 * Task Form Component
 * Create or edit tasks with validation
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks'
import { taskFormSchema } from '@/lib/validation/tasks'
import { useQuery } from '@tanstack/react-query'
import type { Task, TaskFormData, TaskStatus, TaskPriority } from '@/types/tasks'
import { Priority, constructionStyles } from '@/types'

interface TaskFormProps {
  projectId: string
  task?: Task
  onClose: () => void
}

export function TaskForm({ projectId, task, onClose }: TaskFormProps) {
  const [tags, setTags] = useState<string[]>(task?.tags || [])
  const [tagInput, setTagInput] = useState('')
  
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  
  const isEditing = !!task

  // Fetch project members for assignment
  const { data: projectMembers } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/members`)
      if (!response.ok) throw new Error('Failed to fetch members')
      return response.json()
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema) as any,
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: (task?.status || 'todo') as TaskStatus,
      priority: (task?.priority || 'normal') as TaskPriority,
      assigned_to: task?.assigned_to || undefined,
      due_date: task?.due_date?.split('T')[0] || '',
      progress_percentage: task?.progress_percentage || 0,
      tags: task?.tags || []
    }
  })

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        ...data,
        tags,
        project_id: projectId
      }

      if (isEditing) {
        await updateTask.mutateAsync({ id: task.id, ...taskData })
      } else {
        await createTask.mutateAsync(taskData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setValue('tags', newTags)
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    setValue('tags', newTags)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter task title"
              className="mt-1"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter task description"
              rows={3}
              className="mt-1"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                defaultValue={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To */}
            <div>
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select
                defaultValue={watch('assigned_to') || 'unassigned'}
                onValueChange={(value) => setValue('assigned_to', value === 'unassigned' ? '' : value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {projectMembers?.map((member: any) => (
                    <SelectItem key={member.user.id} value={member.user.id}>
                      {member.user.first_name} {member.user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
                className="mt-1"
              />
            </div>

            {/* Progress */}
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                {...register('progress_percentage', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}