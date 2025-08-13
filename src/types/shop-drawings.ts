/**
 * Formula PM V3 Shop Drawings Types
 * Comprehensive type definitions for shop drawings approval workflow
 */

import type { Database } from './database'
import type { UserProfile, Permission } from './auth'

// Database types
type DBShopDrawing = Database['public']['Tables']['shop_drawings']['Row']
type DBShopDrawingInsert = Database['public']['Tables']['shop_drawings']['Insert']
type DBShopDrawingUpdate = Database['public']['Tables']['shop_drawings']['Update']

// =============================================================================
// ENUMS AND CONSTANTS
// =============================================================================

export type ShopDrawingStatus = 
  | 'pending_submittal'      // Being prepared by our team
  | 'submitted_to_client'     // Waiting for client review
  | 'revision_requested'      // Client wants changes
  | 'approved'               // Client approved
  | 'rejected'               // Client rejected

export type CurrentTurn = 'ours' | 'client' | 'complete'

export type DrawingCategory = 
  | 'construction'
  | 'millwork'
  | 'electrical' 
  | 'mechanical'

export type DrawingPriority = 'low' | 'medium' | 'high' | 'critical'

export type CommentType = 
  | 'submittal'         // Comment when submitting to client
  | 'client_feedback'   // Client's response/feedback
  | 'revision_request'  // Client requesting changes
  | 'approval'         // Client approval comment
  | 'rejection'        // Client rejection reason
  | 'general'          // General discussion

// =============================================================================
// CORE INTERFACES
// =============================================================================

// Enhanced shop drawing with computed fields and relationships
export interface ShopDrawing {
  // Core database fields
  id: string
  project_id: string
  title: string
  description?: string
  category: DrawingCategory
  priority: DrawingPriority
  status: ShopDrawingStatus
  trade?: string
  drawing_number?: string
  specification_section?: string
  notes?: string
  due_date?: string
  created_at: string
  updated_at: string
  
  // Submission tracking (our side)
  submitted_by: string          // Team member who created/submitted
  submitted_to_client_date?: string  // When sent to client
  submitted_to_client_by?: string    // Who sent it to client
  
  // Client response tracking
  client_contact?: string       // Which client contact is reviewing
  client_response_date?: string // When client responded
  client_response_type?: 'approved' | 'rejected' | 'revision_requested'
  client_comments?: string      // Client's feedback
  
  // Computed fields
  current_turn?: CurrentTurn    // Whose court the ball is in
  days_with_client?: number     // How long waiting for client
  days_since_submission?: number // Total days since first submission
  is_overdue?: boolean
  days_until_due?: number
  current_revision?: string
  total_revisions?: number
  
  // Relationships (loaded separately)
  project?: {
    id: string
    name: string
  }
  submitted_by_user?: Pick<UserProfile, 'id' | 'first_name' | 'last_name' | 'job_title'>
  submitted_to_client_by_user?: Pick<UserProfile, 'id' | 'first_name' | 'last_name'>
  scope_item?: {
    id: string
    title: string
    category: string
  }
  client_contact_user?: Pick<UserProfile, 'id' | 'first_name' | 'last_name'>
  
  // Comments and revisions (loaded separately)
  comments?: ShopDrawingComment[]
  revisions?: ShopDrawingRevision[]
  current_revision_file?: ShopDrawingRevision
}

// Shop drawing comment
export interface ShopDrawingComment {
  id: string
  shop_drawing_id: string
  user_id: string
  comment_type: CommentType
  comment: string
  attachments: CommentAttachment[]
  is_resolved: boolean
  created_at: string
  updated_at: string
  
  // Relationships
  user?: Pick<UserProfile, 'id' | 'first_name' | 'last_name' | 'job_title'>
}

// Shop drawing revision
export interface ShopDrawingRevision {
  id: string
  shop_drawing_id: string
  revision_number: string
  file_url: string
  file_name: string
  file_size: number
  revision_notes?: string
  uploaded_by: string
  superseded_at?: string
  is_current: boolean
  created_at: string
  
  // Relationships
  uploaded_by_user?: Pick<UserProfile, 'first_name' | 'last_name'>
}

// Comment attachment metadata
export interface CommentAttachment {
  id: string
  file_name: string
  file_url: string
  file_size: number
  content_type: string
  uploaded_at: string
}

// =============================================================================
// FORM DATA INTERFACES
// =============================================================================

export interface ShopDrawingFormData {
  title: string
  description?: string
  category: DrawingCategory
  trade?: string
  priority: DrawingPriority
  due_date: string
  scope_item_id?: string
  drawing_number?: string
  specification_section?: string
  notes?: string
}

export interface ShopDrawingUpdateData extends Partial<ShopDrawingFormData> {
  status?: ShopDrawingStatus
  submitted_to_client_date?: string
  submitted_to_client_by?: string
  client_contact?: string
  client_response_date?: string
  client_response_type?: 'approved' | 'rejected' | 'revision_requested'
  client_comments?: string
}

export interface CommentFormData {
  comment: string
  comment_type: CommentType
  attachments?: File[]
}

export interface RevisionUploadData {
  revision_number: string
  revision_notes?: string
  file: File
}

// =============================================================================
// FILTERING AND LISTING
// =============================================================================

export interface ShopDrawingFilters {
  status?: ShopDrawingStatus[]
  category?: DrawingCategory | 'all'
  priority?: DrawingPriority | 'all'
  current_turn?: CurrentTurn | 'all'
  submitted_by?: string
  client_contact?: string
  due_date_from?: string
  due_date_to?: string
  search_term?: string
}

export interface ShopDrawingListParams extends ShopDrawingFilters {
  project_id: string
  page?: number
  limit?: number
  sort_field?: keyof ShopDrawing
  sort_direction?: 'asc' | 'desc'
}

export interface ShopDrawingListResponse {
  drawings: ShopDrawing[]
  statistics: ShopDrawingStatistics
  total_count: number
  filters_applied: ShopDrawingFilters
}

export interface ShopDrawingStatistics {
  total_drawings: number
  by_status: Record<ShopDrawingStatus, number>
  by_category: Record<DrawingCategory, number>
  by_priority: Record<DrawingPriority, number>
  by_turn: {
    ours: number          // Action required from our team
    client: number        // Waiting on client
    complete: number      // Approved or finally rejected
  }
  metrics: {
    avg_days_with_client: number  // Average time client takes
    avg_days_to_approval: number  // Average total time to approval
    overdue: number               // Past due date
    submitted_this_week: number   // Recent submissions
  }
}

// =============================================================================
// WORKFLOW AND TIMELINE
// =============================================================================

export interface DrawingTimelineEvent {
  id: string
  event_type: 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'revised' | 'commented'
  description: string
  user_id: string
  timestamp: string
  metadata?: Record<string, any>
  
  // Relationships
  user?: Pick<UserProfile, 'first_name' | 'last_name' | 'job_title'>
}

// =============================================================================
// PERMISSIONS
// =============================================================================

export const SHOP_DRAWING_PERMISSIONS: Record<string, Permission[]> = {
  VIEW: ['view_drawings'],
  CREATE: ['upload_drawings'],
  EDIT: ['upload_drawings'],
  DELETE: ['upload_drawings'],
  SUBMIT_TO_CLIENT: ['upload_drawings'],  // Can send to client
  CLIENT_RESPONSE: ['client_review_drawings'], // Can record client response
  DOWNLOAD: ['view_drawings'],
  COMMENT: ['view_drawings'],  // Anyone who can view can comment
  UPLOAD_REVISION: ['upload_drawings']
}

// =============================================================================
// CONSTANTS FOR UI
// =============================================================================

export const SHOP_DRAWING_STATUSES: Record<ShopDrawingStatus, { 
  label: string 
  color: string
  description: string
  turn: CurrentTurn
}> = {
  pending_submittal: { 
    label: 'Pending Submittal', 
    color: 'gray',
    description: 'Being prepared by our team',
    turn: 'ours'
  },
  submitted_to_client: { 
    label: 'Submitted to Client', 
    color: 'orange',
    description: 'Waiting for client review',
    turn: 'client'
  },
  revision_requested: { 
    label: 'Revision Requested', 
    color: 'blue',
    description: 'Client requested changes, our turn to revise',
    turn: 'ours'
  },
  approved: { 
    label: 'Approved', 
    color: 'green',
    description: 'Client approved, ready for construction',
    turn: 'complete'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'red',
    description: 'Client rejected, new approach needed',
    turn: 'ours'
  }
}

export const DRAWING_CATEGORIES: Record<DrawingCategory, {
  label: string
  icon: string
  description: string
}> = {
  construction: {
    label: 'Construction',
    icon: '🏗️',
    description: 'Building design, structural elements, and general construction'
  },
  millwork: {
    label: 'Millwork',
    icon: '🪚',
    description: 'Custom woodwork and cabinetry'
  },
  electrical: {
    label: 'Electrical',
    icon: '⚡',
    description: 'Electrical systems and wiring'
  },
  mechanical: {
    label: 'Mechanical',
    icon: '⚙️',
    description: 'HVAC, plumbing, and mechanical systems'
  }
}

export const DRAWING_PRIORITIES: Record<DrawingPriority, {
  label: string
  color: string
  urgency: number
}> = {
  low: { label: 'Low', color: 'green', urgency: 1 },
  medium: { label: 'Medium', color: 'yellow', urgency: 2 },
  high: { label: 'High', color: 'orange', urgency: 3 },
  critical: { label: 'Critical', color: 'red', urgency: 4 }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Compute whose turn it is based on status
export function getCurrentTurn(drawing: Partial<ShopDrawing>): CurrentTurn {
  if (!drawing.status) return 'ours'
  
  const statusConfig = SHOP_DRAWING_STATUSES[drawing.status]
  return statusConfig?.turn || 'ours'
}

// Calculate days since submission to client
export function getDaysWithClient(drawing: Partial<ShopDrawing>): number {
  if (!drawing.submitted_to_client_date) return 0
  
  const submittedDate = new Date(drawing.submitted_to_client_date)
  const endDate = drawing.client_response_date ? new Date(drawing.client_response_date) : new Date()
  
  return Math.ceil((endDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
}

// Calculate days since first submission
export function getDaysSinceSubmission(drawing: Partial<ShopDrawing>): number {
  if (!drawing.submitted_to_client_date) return 0
  
  const submittedDate = new Date(drawing.submitted_to_client_date)
  const now = new Date()
  
  return Math.ceil((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
}