/**
 * Formula PM V3 Material Specifications Types
 * Simple PM approval workflow for material specifications
 */

import type { Database } from './database'
import type { UserProfile, Permission } from './auth'

// Database types
type DBMaterialSpec = Database['public']['Tables']['material_specs']['Row']
type DBMaterialSpecInsert = Database['public']['Tables']['material_specs']['Insert']  
type DBMaterialSpecUpdate = Database['public']['Tables']['material_specs']['Update']

// =============================================================================
// ENUMS AND CONSTANTS  
// =============================================================================

// Simple PM approval status
export type MaterialSpecStatus = 
  | 'pending'           // Waiting for PM review
  | 'approved'          // PM approved, ready to order
  | 'rejected'          // PM rejected, find alternative  
  | 'revision_required' // PM needs more info/changes

export type MaterialCategory = 
  | 'wood'             // All wood materials
  | 'metal'            // All metals  
  | 'glass'            // All glass
  | 'stone'            // Stone, concrete, masonry
  | 'paint'            // Paint, coatings
  | 'floor'            // All flooring
  | 'fabric'           // Textiles, soft goods
  | 'hardware'         // Fasteners, connectors
  | 'miscellaneous'    // Everything else

export type MaterialPriority = 'low' | 'medium' | 'high' | 'critical'

// =============================================================================
// CORE INTERFACES
// =============================================================================

export interface MaterialSpec {
  // Core database fields
  id: string
  project_id: string
  name: string
  category: MaterialCategory
  priority: MaterialPriority
  status: MaterialSpecStatus
  
  // Specification details
  manufacturer?: string
  model?: string
  spec_number?: string
  specification?: string
  unit?: string
  quantity?: number
  unit_cost?: number
  total_cost?: number
  supplier?: string
  notes?: string
  
  // Approval workflow
  created_by: string           // Who proposed this spec
  created_at: string
  updated_at: string
  reviewed_by?: string         // PM who reviewed
  review_date?: string         // When PM made decision
  review_notes?: string        // PM's feedback
  approval_date?: string       // When approved (if approved)
  
  // Relationships (loaded separately)
  project?: {
    id: string
    name: string
  }
  created_by_user?: Pick<UserProfile, 'id' | 'first_name' | 'last_name' | 'job_title'>
  reviewed_by_user?: Pick<UserProfile, 'id' | 'first_name' | 'last_name'>
  scope_item?: {
    id: string
    title: string
    category: string
  }
}

// =============================================================================
// FORM DATA INTERFACES
// =============================================================================

export interface MaterialSpecFormData {
  name: string
  category: MaterialCategory
  priority: MaterialPriority
  manufacturer?: string
  model?: string
  spec_number?: string
  specification?: string
  unit?: string
  quantity?: number
  unit_cost?: number
  supplier?: string
  notes?: string
  scope_item_id?: string
}

export interface MaterialSpecUpdateData extends Partial<MaterialSpecFormData> {
  status?: MaterialSpecStatus
  reviewed_by?: string
  review_date?: string
  review_notes?: string
  approval_date?: string
}

export interface MaterialSpecReviewData {
  status: MaterialSpecStatus
  review_notes?: string
}

// =============================================================================
// FILTERING AND LISTING
// =============================================================================

export interface MaterialSpecFilters {
  status?: MaterialSpecStatus[]
  category?: MaterialCategory | 'all'
  priority?: MaterialPriority | 'all'
  created_by?: string
  reviewed_by?: string
  supplier?: string
  search_term?: string
}

export interface MaterialSpecListParams extends MaterialSpecFilters {
  project_id: string
  page?: number
  limit?: number
  sort_field?: keyof MaterialSpec
  sort_direction?: 'asc' | 'desc'
}

export interface MaterialSpecListResponse {
  specs: MaterialSpec[]
  statistics: MaterialSpecStatistics
  total_count: number
  filters_applied: MaterialSpecFilters
}

export interface MaterialSpecStatistics {
  total_specs: number
  by_status: Record<MaterialSpecStatus, number>
  by_category: Record<MaterialCategory, number>
  by_priority: Record<MaterialPriority, number>
  cost_summary: {
    total_approved_cost: number
    total_pending_cost: number
    avg_spec_cost: number
    most_expensive_category: string
  }
  pm_metrics: {
    pending_pm_review: number
    avg_review_days: number
    approved_this_week: number
    rejected_this_month: number
  }
}

// =============================================================================
// PERMISSIONS
// =============================================================================

export const MATERIAL_SPEC_PERMISSIONS: Record<string, Permission[]> = {
  VIEW: ['view_materials'],
  CREATE: ['create_material_specs'], 
  EDIT: ['create_material_specs'],
  DELETE: ['create_material_specs'],
  PM_REVIEW: ['approve_material_specs'],  // Only PMs can approve/reject
  VIEW_COSTS: ['view_material_costs'],
  DOWNLOAD: ['view_materials']
}

// =============================================================================
// CONSTANTS FOR UI
// =============================================================================

export const MATERIAL_SPEC_STATUSES: Record<MaterialSpecStatus, {
  label: string
  color: string
  description: string
  icon: string
}> = {
  pending: {
    label: 'Pending Review',
    color: 'yellow',
    description: 'Waiting for PM approval',
    icon: '⏳'
  },
  approved: {
    label: 'Approved',
    color: 'green', 
    description: 'PM approved, ready to order',
    icon: '✅'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    description: 'PM rejected, find alternative',
    icon: '❌'
  },
  revision_required: {
    label: 'Revision Required',
    color: 'blue',
    description: 'PM needs more information',
    icon: '📝'
  }
}

export const MATERIAL_CATEGORIES: Record<MaterialCategory, {
  label: string
  icon: string
  description: string
}> = {
  wood: {
    label: 'Wood',
    icon: '🌳',
    description: 'All wood materials and lumber'
  },
  metal: {
    label: 'Metal', 
    icon: '🔩',
    description: 'All metal materials and components'
  },
  glass: {
    label: 'Glass',
    icon: '🪟',
    description: 'All glass materials and glazing'
  },
  stone: {
    label: 'Stone',
    icon: '🧱', 
    description: 'Stone, concrete, and masonry materials'
  },
  paint: {
    label: 'Paint',
    icon: '🎨',
    description: 'Paint, coatings, and finishes'
  },
  floor: {
    label: 'Floor',
    icon: '🏠',
    description: 'All flooring materials'
  },
  fabric: {
    label: 'Fabric',
    icon: '🧵',
    description: 'Textiles and soft goods'
  },
  hardware: {
    label: 'Hardware',
    icon: '🔧',
    description: 'Fasteners, connectors, and hardware'
  },
  miscellaneous: {
    label: 'Miscellaneous',
    icon: '📦',
    description: 'Other materials and specialty items'
  }
}

export const MATERIAL_PRIORITIES: Record<MaterialPriority, {
  label: string
  color: string
  urgency: number
  description: string
}> = {
  low: { 
    label: 'Low', 
    color: 'green', 
    urgency: 1,
    description: 'Can wait for standard procurement'
  },
  medium: { 
    label: 'Medium', 
    color: 'yellow', 
    urgency: 2,
    description: 'Normal priority procurement'
  },
  high: { 
    label: 'High', 
    color: 'orange', 
    urgency: 3,
    description: 'Expedited procurement needed'
  },
  critical: { 
    label: 'Critical', 
    color: 'red', 
    urgency: 4,
    description: 'Urgent - blocking construction'
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Calculate total cost for a material spec
export function calculateTotalCost(spec: Partial<MaterialSpec>): number {
  if (!spec.quantity || !spec.unit_cost) return 0
  return spec.quantity * spec.unit_cost
}

// Calculate days since submission for PM review
export function getDaysSinceSubmission(spec: Partial<MaterialSpec>): number {
  if (!spec.created_at) return 0
  
  const createdDate = new Date(spec.created_at)
  const now = new Date()
  
  return Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
}

// Calculate days taken for PM to review
export function getReviewDays(spec: Partial<MaterialSpec>): number {
  if (!spec.created_at || !spec.review_date) return 0
  
  const createdDate = new Date(spec.created_at)
  const reviewDate = new Date(spec.review_date)
  
  return Math.ceil((reviewDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
}

// Check if material spec is overdue for review (over 3 days)
export function isOverdueForReview(spec: Partial<MaterialSpec>): boolean {
  if (spec.status !== 'pending') return false
  return getDaysSinceSubmission(spec) > 3
}