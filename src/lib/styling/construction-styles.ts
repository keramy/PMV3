/**
 * Formula PM V3 - Construction UI Styling Utilities
 * Centralized styling patterns for construction project management
 * Now uses shared constants to eliminate duplicate definitions
 * Provides consistent visual patterns across all components
 */

import { cn } from '@/lib/utils'
import { 
  PRIORITY_CONFIG, 
  CONSTRUCTION_CATEGORY_CONFIG, 
  BASE_STATUS_CONFIG 
} from '@/lib/constants'
import type { 
  Priority, 
  ConstructionCategory, 
  ColorConfig 
} from '@/types/shared'

// ============================================================================
// RE-EXPORT SHARED TYPES FOR BACKWARD COMPATIBILITY
// ============================================================================

export type TaskPriority = Priority
export type { Priority, ConstructionCategory, ColorConfig }

/**
 * Centralized color configurations for different status types
 */
const STATUS_COLORS: Record<string, ColorConfig> = {
  // Task Statuses
  not_started: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    badgeVariant: 'outline',
    icon: 'text-gray-500'
  },
  in_progress: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    badgeVariant: 'default',
    icon: 'text-blue-500'
  },
  completed: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    badgeVariant: 'outline',
    icon: 'text-green-500'
  },
  cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    badgeVariant: 'destructive',
    icon: 'text-red-500'
  }
}

// ============================================================================
// UTILITY FUNCTIONS USING SHARED CONSTANTS
// ============================================================================

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color configuration for any status using shared constants
 */
export function getStatusConfig(status: string): ColorConfig {
  return BASE_STATUS_CONFIG[status]?.colorConfig || BASE_STATUS_CONFIG.not_started.colorConfig
}

/**
 * Get color configuration for priority levels using shared constants
 */
export function getPriorityConfig(priority: Priority): ColorConfig {
  return PRIORITY_CONFIG[priority]?.colorConfig || PRIORITY_CONFIG.medium.colorConfig
}

/**
 * Get color configuration for construction categories using shared constants
 */
export function getCategoryConfig(category: ConstructionCategory): ColorConfig {
  return CONSTRUCTION_CATEGORY_CONFIG[category]?.colorConfig || CONSTRUCTION_CATEGORY_CONFIG.construction.colorConfig
}

/**
 * Legacy compatibility - returns Tailwind classes for status
 */
export function getStatusColor(status: string): string {
  const config = getStatusConfig(status)
  return `${config.bg} ${config.text} ${config.border}`
}

/**
 * Legacy compatibility - returns Tailwind classes for priority
 */
export function getPriorityColor(priority: Priority): string {
  const config = getPriorityConfig(priority)
  return config.text
}

/**
 * Get badge variant for priority using shared constants
 */
export function getPriorityBadgeVariant(priority: Priority): 'default' | 'destructive' | 'outline' | 'secondary' {
  const config = getPriorityConfig(priority)
  return config.badgeVariant
}

/**
 * Get badge props for priority with consistent styling using shared constants
 */
export function getPriorityBadgeProps(priority: Priority, className?: string) {
  const config = getPriorityConfig(priority)
  const label = PRIORITY_CONFIG[priority]?.label || priority
  
  return {
    variant: config.badgeVariant,
    className: cn(config.text, className),
    children: label
  }
}

/**
 * Get badge props for category with consistent styling using shared constants
 */
export function getCategoryBadgeProps(category: ConstructionCategory, className?: string) {
  const config = getCategoryConfig(category)
  const label = CONSTRUCTION_CATEGORY_CONFIG[category]?.label || category
  
  return {
    variant: config.badgeVariant,
    className: cn(config.text, className),
    children: label
  }
}

/**
 * Legacy compatibility - Get category color class using shared constants
 */
export function getCategoryColor(category: string): string {
  const config = getCategoryConfig(category as ConstructionCategory)
  return `${config.bg} ${config.text}`
}

/**
 * Export commonly used combinations for quick migration
 * Now uses shared constants from centralized location
 */
export const constructionStyles = {
  priority: {
    getColor: getPriorityColor,
    getConfig: getPriorityConfig,
    getBadgeVariant: getPriorityBadgeVariant,
    getBadgeProps: getPriorityBadgeProps,
    config: PRIORITY_CONFIG
  },
  category: {
    getColor: getCategoryColor,
    getConfig: getCategoryConfig,
    getBadgeProps: getCategoryBadgeProps,
    config: CONSTRUCTION_CATEGORY_CONFIG
  },
  status: {
    getColor: getStatusColor,
    getConfig: getStatusConfig,
    config: BASE_STATUS_CONFIG
  }
}

export default constructionStyles