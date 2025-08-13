/**
 * Formula PM V3 - Shared Constants
 * Consolidated constants used across multiple modules
 * Eliminates duplicate constant definitions and provides single source of truth
 */

import type { Priority, ConstructionCategory, ColorConfig } from '@/types/shared'

// ============================================================================
// PRIORITY CONFIGURATION
// ============================================================================

/**
 * Unified priority configuration - replaces 4 separate priority objects
 * Used by: Tasks, Shop Drawings, Material Specs, Scope Items
 */
export const PRIORITY_CONFIG: Record<Priority, {
  label: string
  color: string
  urgency: number
  badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary'
  colorConfig: ColorConfig
}> = {
  low: {
    label: 'Low',
    color: 'gray',
    urgency: 1,
    badgeVariant: 'outline',
    colorConfig: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-300',
      badgeVariant: 'outline',
      icon: 'text-gray-500'
    }
  },
  medium: {
    label: 'Medium',
    color: 'blue', 
    urgency: 2,
    badgeVariant: 'secondary',
    colorConfig: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-300',
      badgeVariant: 'secondary',
      icon: 'text-blue-500'
    }
  },
  high: {
    label: 'High',
    color: 'orange',
    urgency: 3,
    badgeVariant: 'secondary',
    colorConfig: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-300',
      badgeVariant: 'secondary',
      icon: 'text-orange-500'
    }
  },
  critical: {
    label: 'Critical',
    color: 'red',
    urgency: 4,
    badgeVariant: 'destructive',
    colorConfig: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-300',
      badgeVariant: 'destructive',
      icon: 'text-red-500'
    }
  }
}

// ============================================================================
// CONSTRUCTION CATEGORY CONFIGURATION
// ============================================================================

/**
 * Unified construction category configuration - replaces 4 separate category objects
 * Used by: Shop Drawings, Material Specs, Scope Items
 */
export const CONSTRUCTION_CATEGORY_CONFIG: Record<ConstructionCategory, {
  label: string
  color: string
  icon?: string
  description?: string
  colorConfig: ColorConfig
}> = {
  construction: {
    label: 'Construction',
    color: 'blue',
    icon: '🏗️',
    description: 'General construction work and structural elements',
    colorConfig: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-300',
      badgeVariant: 'default',
      icon: 'text-blue-500'
    }
  },
  millwork: {
    label: 'Millwork',
    color: 'amber',
    icon: '🪵',
    description: 'Custom woodwork, cabinetry, and trim',
    colorConfig: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-300',
      badgeVariant: 'secondary',
      icon: 'text-amber-500'
    }
  },
  electrical: {
    label: 'Electrical',
    color: 'yellow',
    icon: '⚡',
    description: 'Electrical systems, wiring, and fixtures',
    colorConfig: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-300',
      badgeVariant: 'secondary',
      icon: 'text-yellow-500'
    }
  },
  mechanical: {
    label: 'Mechanical',
    color: 'slate',
    icon: '⚙️',
    description: 'Mechanical systems and equipment',
    colorConfig: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-300',
      badgeVariant: 'outline',
      icon: 'text-slate-500'
    }
  },
  plumbing: {
    label: 'Plumbing',
    color: 'cyan',
    icon: '🚿',
    description: 'Plumbing systems, pipes, and fixtures',
    colorConfig: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      border: 'border-cyan-300',
      badgeVariant: 'secondary',
      icon: 'text-cyan-500'
    }
  },
  hvac: {
    label: 'HVAC',
    color: 'purple',
    icon: '❄️',
    description: 'Heating, ventilation, and air conditioning',
    colorConfig: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-300',
      badgeVariant: 'secondary',
      icon: 'text-purple-500'
    }
  }
}

// ============================================================================
// STATUS CONFIGURATION (BASE)
// ============================================================================

/**
 * Base status configuration that can be extended by specific workflows
 */
export const BASE_STATUS_CONFIG: Record<string, {
  label: string
  description?: string
  colorConfig: ColorConfig
}> = {
  not_started: {
    label: 'Not Started',
    description: 'Work has not begun',
    colorConfig: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      badgeVariant: 'outline',
      icon: 'text-gray-500'
    }
  },
  in_progress: {
    label: 'In Progress',
    description: 'Work is currently underway',
    colorConfig: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      badgeVariant: 'default',
      icon: 'text-blue-500'
    }
  },
  completed: {
    label: 'Completed',
    description: 'Work has been finished',
    colorConfig: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      badgeVariant: 'outline',
      icon: 'text-green-500'
    }
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Work has been cancelled',
    colorConfig: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      badgeVariant: 'destructive',
      icon: 'text-red-500'
    }
  },
  on_hold: {
    label: 'On Hold',
    description: 'Work is temporarily paused',
    colorConfig: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      badgeVariant: 'secondary',
      icon: 'text-orange-500'
    }
  }
}

// ============================================================================
// COMMON ARRAYS FOR SELECT OPTIONS
// ============================================================================

/**
 * Priority options for dropdowns and filters
 */
export const PRIORITY_OPTIONS = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
  value: value as Priority,
  label: config.label,
  urgency: config.urgency
})).sort((a, b) => b.urgency - a.urgency)

/**
 * Category options for dropdowns and filters
 */
export const CATEGORY_OPTIONS = Object.entries(CONSTRUCTION_CATEGORY_CONFIG).map(([value, config]) => ({
  value: value as ConstructionCategory,
  label: config.label,
  icon: config.icon,
  description: config.description
}))

/**
 * Base status options for dropdowns and filters
 */
export const BASE_STATUS_OPTIONS = Object.entries(BASE_STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  description: config.description
}))

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_SORT_DIRECTION: 'desc' as const,
  DEFAULT_SORT_FIELD: 'created_at'
} as const

// ============================================================================
// PERMISSIONS - COMMON PERMISSION STRINGS
// ============================================================================

/**
 * Common permission strings used across modules
 */
export const COMMON_PERMISSIONS = {
  // CRUD permissions pattern
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECTS: 'create_projects', 
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',
  
  VIEW_TASKS: 'view_tasks',
  CREATE_TASKS: 'create_tasks',
  EDIT_TASKS: 'edit_tasks',
  DELETE_TASKS: 'delete_tasks',
  
  VIEW_DRAWINGS: 'view_drawings',
  CREATE_DRAWINGS: 'create_drawings',
  EDIT_DRAWINGS: 'edit_drawings',
  DELETE_DRAWINGS: 'delete_drawings',
  
  // Special permissions
  MANAGE_USERS: 'manage_users',
  VIEW_FINANCES: 'view_finances',
  APPROVE_BUDGETS: 'approve_budgets',
  CLIENT_ACCESS: 'client_access'
} as const

// ============================================================================
// DATE & TIME FORMATS
// ============================================================================

/**
 * Standard date and time formats used across the application
 */
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM d, yyyy',
  INPUT_DATE: 'yyyy-MM-dd',
  DISPLAY_DATETIME: 'MMM d, yyyy h:mm a',
  ISO_DATETIME: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
  TIME_ONLY: 'h:mm a',
  SHORT_DATE: 'MM/dd/yy',
  LONG_DATE: 'EEEE, MMMM do, yyyy'
} as const

// ============================================================================
// FILE & UPLOAD CONSTANTS
// ============================================================================

/**
 * File upload constraints and supported types
 */
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SUPPORTED_SPREADSHEET_TYPES: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  MAX_ATTACHMENTS: 5
} as const