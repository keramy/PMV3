/**
 * Task Validation Schemas
 * Zod schemas for task and comment validation
 */

import { z } from 'zod'

// Enum schemas
export const taskStatusSchema = z.enum(['todo', 'in_progress', 'review', 'completed'])
export const taskPrioritySchema = z.enum(['normal', 'high', 'urgent'])
export const commentTypeSchema = z.enum(['comment', 'status_change', 'assignment', 'attachment'])

// Attachment schema
export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255),
  url: z.string().url(),
  type: z.string(),
  size: z.number().positive(),
  uploaded_by: z.string().optional(),
  uploaded_at: z.string().optional()
})

// Task form validation
export const taskFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),
  
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('normal'),
  
  assigned_to: z.string().uuid('Invalid user ID').optional().nullable(),
  
  due_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .nullable(),
  
  progress_percentage: z.number()
    .min(0, 'Progress must be at least 0')
    .max(100, 'Progress cannot exceed 100')
    .default(0),
  
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
  
  attachments: z.array(attachmentSchema).max(10, 'Maximum 10 attachments allowed').optional()
})

// Task update validation (all fields optional)
export const taskUpdateSchema = taskFormSchema.partial()

// Comment validation
export const taskCommentSchema = z.object({
  comment: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
  
  comment_type: commentTypeSchema.default('comment'),
  
  mentions: z.array(z.string().uuid()).optional(),
  
  attachments: z.array(attachmentSchema).max(5, 'Maximum 5 attachments per comment').optional()
})

// Task filter validation
export const taskFiltersSchema = z.object({
  project_id: z.string().uuid().optional(),
  status: z.array(taskStatusSchema).optional(),
  priority: z.array(taskPrioritySchema).optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  due_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  due_date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  overdue_only: z.coerce.boolean().optional(),
  assigned_to_me: z.coerce.boolean().optional(),
  mentioning_me: z.coerce.boolean().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20)
})

// Export type inferences for validation
export type TaskFormValidation = z.infer<typeof taskFormSchema>
export type TaskUpdateValidation = z.infer<typeof taskUpdateSchema>
export type TaskCommentValidation = z.infer<typeof taskCommentSchema>
export type TaskFiltersValidation = z.infer<typeof taskFiltersSchema>