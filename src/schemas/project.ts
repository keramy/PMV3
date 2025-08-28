/**
 * Formula PM V3 Project Schemas
 * Single source of truth for project validation across forms, APIs, and database operations
 */

import { z } from 'zod'

// ============================================================================
// BASE PROJECT VALIDATION RULES
// ============================================================================

// Construction project naming standards
const PROJECT_NAME_REGEX = /^[A-Za-z0-9\s\-_()]+$/
const PROJECT_NUMBER_REGEX = /^PRJ-\d{4}-\d{3}$/

// Business rules for construction projects
const MIN_PROJECT_DURATION_DAYS = 7 // Minimum project duration
const MAX_PROJECT_DURATION_YEARS = 5 // Maximum project duration

// ============================================================================
// PROJECT STATUS AND PRIORITY DEFINITIONS
// ============================================================================

export const ProjectStatusEnum = z.enum([
  'planning',
  'in_progress', 
  'on_hold',
  'completed',
  'cancelled'
])

export const ProjectPriorityEnum = z.enum([
  'low',
  'medium', 
  'high',
  'critical'
])

// ============================================================================
// CORE PROJECT SCHEMAS
// ============================================================================

// Project creation form schema (what users input)
export const ProjectCreateFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(200, 'Project name must be under 200 characters')
    .regex(PROJECT_NAME_REGEX, 'Project name contains invalid characters'),
  
  client_name: z
    .string()
    .min(1, 'Client name is required')
    .max(100, 'Client name must be under 100 characters'),
  
  description: z
    .string()
    .max(2000, 'Description must be under 2000 characters')
    .optional(),
  
  start_date: z
    .string()
    .datetime('Invalid start date format')
    .optional(),
  
  end_date: z
    .string()
    .datetime('Invalid end date format')
    .optional(),
  
  budget: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === '') return undefined
      const num = parseFloat(val)
      if (isNaN(num)) throw new Error('Invalid budget amount')
      return num
    })
    .pipe(
      z.number()
        .positive('Budget must be positive')
        .max(100_000_000, 'Budget exceeds maximum limit')
        .optional()
    ),
  
  status: ProjectStatusEnum.default('planning'),
  
  priority: ProjectPriorityEnum.default('medium').optional(),
  
  // Construction-specific fields
  project_number: z
    .string()
    .regex(PROJECT_NUMBER_REGEX, 'Project number must match PRJ-YYYY-XXX format')
    .optional(),
  
  address: z
    .string()
    .max(500, 'Address must be under 500 characters')
    .optional()
})
  .refine((data) => {
    // Business rule: End date must be after start date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      return endDate > startDate
    }
    return true
  }, {
    message: 'End date must be after start date',
    path: ['end_date']
  })
  .refine((data) => {
    // Business rule: Project duration limits
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      const durationMs = endDate.getTime() - startDate.getTime()
      const durationDays = durationMs / (1000 * 60 * 60 * 24)
      
      return durationDays >= MIN_PROJECT_DURATION_DAYS && 
             durationDays <= (MAX_PROJECT_DURATION_YEARS * 365)
    }
    return true
  }, {
    message: `Project duration must be between ${MIN_PROJECT_DURATION_DAYS} days and ${MAX_PROJECT_DURATION_YEARS} years`,
    path: ['end_date']
  })

// API submission schema (transformed for database)
export const ProjectCreateApiSchema = ProjectCreateFormSchema.transform((data) => ({
  ...data,
  // Ensure dates are properly formatted for database
  start_date: data.start_date || null,
  end_date: data.end_date || null,
  budget: data.budget || null,
  priority: data.priority || 'medium',
  // Generate project number if not provided
  project_number: data.project_number || `PRJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
  // Add metadata
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// Database response schema (what comes back from API)
export const ProjectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  client_name: z.string(),
  description: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  budget: z.number().nullable(),
  actual_cost: z.number().nullable(),
  status: ProjectStatusEnum,
  priority: ProjectPriorityEnum.nullable(),
  progress_percentage: z.number().min(0).max(100).nullable(),
  project_number: z.string().nullable(),
  address: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  created_by: z.string().uuid().nullable(),
  project_manager: z.string().uuid().nullable(),
  company_id: z.string().uuid().nullable()
})

// ============================================================================
// ROLE-BASED VALIDATION SCHEMAS
// ============================================================================

// Base object schema without refinements (for role-based modifications)
const ProjectCreateBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(200, 'Project name must be under 200 characters')
    .regex(PROJECT_NAME_REGEX, 'Project name contains invalid characters'),
  
  client_name: z
    .string()
    .min(1, 'Client name is required')
    .max(100, 'Client name must be under 100 characters'),
  
  description: z
    .string()
    .max(2000, 'Description must be under 2000 characters')
    .optional(),
  
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  
  budget: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === '') return undefined
      const num = parseFloat(val)
      if (isNaN(num) || num < 0) throw new Error('Invalid budget amount')
      return num
    }),
  
  priority: z
    .enum(['low', 'medium', 'high', 'critical'])
    .default('medium'),
  
  project_number: z.string().optional(),
  address: z.string().optional(),
})

export const getProjectCreateSchemaForRole = (role: string) => {
  const baseSchema = ProjectCreateBaseSchema

  switch (role) {
    case 'client':
      // Clients can't set budget or internal fields
      return baseSchema.omit({ 
        budget: true, 
        priority: true, 
        project_number: true 
      })
    
    case 'team_member':
      // Team members have budget limits
      return baseSchema.extend({
        budget: z.string().optional().transform((val) => {
          if (!val || val === '') return undefined
          const num = parseFloat(val)
          if (isNaN(num)) throw new Error('Invalid budget amount')
          return num
        }).pipe(
          z.number()
            .positive('Budget must be positive')
            .max(50_000, 'Team members cannot create projects over $50,000')
            .optional()
        )
      })
    
    case 'project_manager':
    case 'technical_manager':
    case 'admin':
      // Full access to all fields
      return baseSchema
    
    default:
      // Unknown role gets minimal access
      return baseSchema.omit({ 
        budget: true, 
        priority: true, 
        project_number: true 
      })
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ProjectCreateFormData = z.infer<typeof ProjectCreateFormSchema>
export type ProjectCreateApiData = z.infer<typeof ProjectCreateApiSchema>
export type ProjectResponseData = z.infer<typeof ProjectResponseSchema>
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>
export type ProjectPriority = z.infer<typeof ProjectPriorityEnum>

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const validateProjectForm = (data: unknown, userRole = 'team_member') => {
  const schema = getProjectCreateSchemaForRole(userRole)
  return schema.safeParse(data)
}

export const transformFormToApi = (formData: ProjectCreateFormData): ProjectCreateApiData => {
  return ProjectCreateApiSchema.parse(formData)
}

export const isValidProjectStatus = (status: string): status is ProjectStatus => {
  return ProjectStatusEnum.safeParse(status).success
}

export const isValidProjectPriority = (priority: string): priority is ProjectPriority => {
  return ProjectPriorityEnum.safeParse(priority).success
}