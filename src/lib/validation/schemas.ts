import { z } from 'zod'

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

export const uuidSchema = z.string().uuid('Invalid UUID format')

export const positiveNumberSchema = z.number().positive('Must be a positive number')

export const optionalPositiveNumberSchema = z.number().positive().optional()

export const emailSchema = z.string().email('Invalid email format')

export const nonEmptyStringSchema = z.string().min(1, 'Cannot be empty')

export const optionalStringSchema = z.string().optional()

export const dateStringSchema = z.string().datetime('Invalid date format')

export const optionalDateStringSchema = z.string().datetime().optional()

// ============================================================================
// PROJECT VALIDATION SCHEMAS
// ============================================================================

export const createProjectSchema = z.object({
  name: nonEmptyStringSchema.max(100, 'Name too long'),
  description: optionalStringSchema,
  budget: optionalPositiveNumberSchema,
  start_date: optionalDateStringSchema,
  end_date: optionalDateStringSchema,
  company_id: uuidSchema,
  project_manager: uuidSchema.optional()
})

export const updateProjectSchema = createProjectSchema.partial()

export const projectIdSchema = z.object({
  id: uuidSchema
})

// ============================================================================
// TASK VALIDATION SCHEMAS
// ============================================================================

export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled'])

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const createTaskSchema = z.object({
  title: nonEmptyStringSchema.max(200, 'Title too long'),
  description: optionalStringSchema,
  project_id: uuidSchema,
  assigned_to: uuidSchema.optional(),
  due_date: optionalDateStringSchema,
  priority: taskPrioritySchema.default('medium'),
  status: taskStatusSchema.default('pending')
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: uuidSchema
})

// ============================================================================
// SHOP DRAWINGS VALIDATION SCHEMAS
// ============================================================================

export const shopDrawingStatusSchema = z.enum([
  'pending_submittal',
  'submitted_to_client', 
  'revision_requested',
  'approved',
  'rejected'
])

export const createShopDrawingSchema = z.object({
  project_id: uuidSchema,
  drawing_number: nonEmptyStringSchema.max(50, 'Drawing number too long'),
  title: nonEmptyStringSchema.max(200, 'Title too long'),
  description: optionalStringSchema,
  revision: z.string().max(10, 'Revision too long').default('A'),
  status: shopDrawingStatusSchema.default('pending_submittal'),
  due_date: optionalDateStringSchema,
  file_url: z.string().url('Invalid file URL').optional(),
  file_name: optionalStringSchema,
  file_size: z.number().int().positive().optional()
})

export const updateShopDrawingSchema = createShopDrawingSchema.partial().extend({
  id: uuidSchema,
  review_comments: optionalStringSchema,
  reviewed_by: uuidSchema.optional(),
  reviewed_at: optionalDateStringSchema
})

// ============================================================================
// MATERIAL SPECS VALIDATION SCHEMAS
// ============================================================================

export const materialSpecStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected', 
  'revision_required'
])

export const materialCategorySchema = z.enum([
  'Construction',
  'Millwork',
  'Electrical',
  'Mechanical',
  'Plumbing', 
  'HVAC',
  'Finishes',
  'Other'
])

export const createMaterialSpecSchema = z.object({
  project_id: uuidSchema,
  item_name: nonEmptyStringSchema.max(200, 'Item name too long'),
  category: materialCategorySchema,
  description: optionalStringSchema,
  quantity: positiveNumberSchema,
  unit: nonEmptyStringSchema.max(20, 'Unit too long'),
  unit_cost: optionalPositiveNumberSchema,
  total_cost: optionalPositiveNumberSchema,
  supplier: optionalStringSchema.max(100, 'Supplier name too long'),
  status: materialSpecStatusSchema.default('pending'),
  notes: optionalStringSchema
})

export const updateMaterialSpecSchema = createMaterialSpecSchema.partial().extend({
  id: uuidSchema,
  reviewed_by: uuidSchema.optional(),
  reviewed_at: optionalDateStringSchema
})

// ============================================================================
// USER PROFILE VALIDATION SCHEMAS  
// ============================================================================

export const permissionSchema = z.enum([
  'view_projects',
  'create_projects', 
  'edit_projects',
  'delete_projects',
  'view_project_costs',
  'edit_project_costs',
  'view_tasks',
  'create_tasks',
  'edit_tasks',
  'delete_tasks',
  'view_scope_items',
  'create_scope_items',
  'edit_scope_items',
  'delete_scope_items',
  'view_shop_drawings',
  'create_shop_drawings',
  'edit_shop_drawings',
  'delete_shop_drawings',
  'internal_review_drawings',
  'client_review_drawings',
  'view_material_specs',
  'create_material_specs',
  'edit_material_specs',
  'delete_material_specs',
  'approve_material_specs',
  'view_rfis',
  'create_rfis',
  'edit_rfis',
  'delete_rfis',
  'view_change_orders',
  'create_change_orders',
  'edit_change_orders',
  'delete_change_orders',
  'approve_change_orders',
  'view_users',
  'create_users',
  'edit_users',
  'delete_users',
  'admin_access'
])

export const updateUserProfileSchema = z.object({
  id: uuidSchema,
  first_name: optionalStringSchema.max(50, 'First name too long'),
  last_name: optionalStringSchema.max(50, 'Last name too long'),  
  job_title: optionalStringSchema.max(100, 'Job title too long'),
  permissions: z.array(permissionSchema).optional()
})

// ============================================================================
// API ROUTE VALIDATION HELPERS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
})

export const sortSchema = z.object({
  field: nonEmptyStringSchema,
  direction: z.enum(['asc', 'desc']).default('asc')
})

export const filterSchema = z.object({
  status: optionalStringSchema,
  priority: optionalStringSchema,
  assigned_to: uuidSchema.optional(),
  project_id: uuidSchema.optional(),
  start_date: optionalDateStringSchema,
  end_date: optionalDateStringSchema
})

// ============================================================================
// RESPONSE VALIDATION SCHEMAS
// ============================================================================

export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: nonEmptyStringSchema,
  message: optionalStringSchema,
  code: z.string().optional()
})

export const apiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: optionalStringSchema
})

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: string[]
}

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return {
      success: true,
      data: result
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }
    }
    return {
      success: false,  
      errors: ['Validation failed']
    }
  }
}

export function safeParseSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): z.SafeParseReturnType<unknown, T> {
  return schema.safeParse(data)
}