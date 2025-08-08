/**
 * Formula PM V3 Database Type Definitions
 * Complete construction project management schema
 * Based on proven V2 production database with V3 enhancements
 */

import type { Permission } from './auth'

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type ProjectStatus = 
  | 'planning'
  | 'bidding' 
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  client_id: string
  project_manager_id: string
  budget?: number
  start_date?: string
  end_date?: string
  completion_percentage: number
  created_at: string
  updated_at: string
  company_id: string
}

// ============================================================================
// SCOPE MANAGEMENT TYPES
// ============================================================================

export type ScopeCategory = 
  | 'construction'
  | 'millwork'
  | 'electrical'
  | 'mechanical'
  | 'plumbing'
  | 'hvac'

export type ScopeStatus = 
  | 'not_started'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'blocked'
  | 'cancelled'

export interface ScopeItem {
  id: string
  project_id: string
  name: string
  description?: string
  category: ScopeCategory
  status: ScopeStatus
  assigned_subcontractor_id?: string
  estimated_cost?: number
  actual_cost?: number
  start_date?: string
  due_date?: string
  completion_percentage: number
  created_at: string
  updated_at: string
  
  // Enhanced V3 fields
  priority: 'low' | 'medium' | 'high' | 'critical'
  materials_required?: string[]
  labor_hours_estimate?: number
  dependencies?: string[] // other scope_item IDs
}

// ============================================================================
// WORKFLOW TYPES (Shop Drawings, Material Specs)
// ============================================================================

export type WorkflowStatus = 
  | 'draft'
  | 'internal_review'
  | 'client_review' 
  | 'approved'
  | 'rejected'
  | 'revision_required'

export interface ShopDrawing {
  id: string
  project_id: string
  scope_item_id?: string
  name: string
  drawing_number: string
  revision: string
  status: WorkflowStatus
  file_url: string
  submitted_by: string
  submitted_at: string
  reviewed_by?: string
  reviewed_at?: string
  approved_by?: string
  approved_at?: string
  comments?: string
  created_at: string
  updated_at: string
}

export interface MaterialSpec {
  id: string
  project_id: string
  scope_item_id?: string
  name: string
  specification: string
  manufacturer?: string
  model_number?: string
  status: WorkflowStatus
  estimated_cost?: number
  supplier_id?: string
  submitted_by: string
  submitted_at: string
  approved_by?: string
  approved_at?: string
  comments?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// TASK MANAGEMENT TYPES
// ============================================================================

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled'

export interface Task {
  id: string
  project_id: string
  scope_item_id?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to?: string
  created_by: string
  due_date?: string
  completed_at?: string
  estimated_hours?: number
  actual_hours?: number
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  comment: string
  created_by: string
  created_at: string
}

// ============================================================================
// MILESTONE & TIMELINE TYPES
// ============================================================================

export interface Milestone {
  id: string
  project_id: string
  name: string
  description?: string
  due_date: string
  completed_at?: string
  is_critical: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// RFI & CHANGE ORDER TYPES
// ============================================================================

export interface RFI {
  id: string
  project_id: string
  title: string
  description: string
  status: WorkflowStatus
  submitted_by: string
  submitted_at: string
  responded_by?: string
  responded_at?: string
  response?: string
  created_at: string
  updated_at: string
}

export interface ChangeOrder {
  id: string
  project_id: string
  title: string
  description: string
  cost_impact?: number
  time_impact_days?: number
  status: WorkflowStatus
  submitted_by: string
  submitted_at: string
  approved_by?: string
  approved_at?: string
  implemented_at?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// COMPANY & USER TYPES
// ============================================================================

export interface Company {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  company_id: string
  name: string
  email?: string
  phone?: string
  company_name?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Subcontractor {
  id: string
  company_id: string
  name: string
  company_name: string
  email?: string
  phone?: string
  specialties: ScopeCategory[]
  rating?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// USER PROFILE TYPE (with dynamic permissions)
// ============================================================================

export interface UserProfile {
  id: string
  email: string
  full_name: string
  job_title: string
  company_id: string
  permissions: Permission[]
  is_active: boolean
  avatar_url?: string
  phone?: string
  department?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// SUPABASE DATABASE SCHEMA - Complete V2 Schema with V3 Enhancements
// ============================================================================

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
      }
      subcontractors: {
        Row: Subcontractor
        Insert: Omit<Subcontractor, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subcontractor, 'id' | 'created_at' | 'updated_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'completion_percentage'>
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
      }
      scope_items: {
        Row: ScopeItem
        Insert: Omit<ScopeItem, 'id' | 'created_at' | 'updated_at' | 'completion_percentage'>
        Update: Partial<Omit<ScopeItem, 'id' | 'created_at' | 'updated_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
      }
      task_comments: {
        Row: TaskComment
        Insert: Omit<TaskComment, 'id' | 'created_at'>
        Update: Partial<Omit<TaskComment, 'id' | 'created_at'>>
      }
      shop_drawings: {
        Row: ShopDrawing
        Insert: Omit<ShopDrawing, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ShopDrawing, 'id' | 'created_at' | 'updated_at'>>
      }
      material_specs: {
        Row: MaterialSpec
        Insert: Omit<MaterialSpec, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MaterialSpec, 'id' | 'created_at' | 'updated_at'>>
      }
      milestones: {
        Row: Milestone
        Insert: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Milestone, 'id' | 'created_at' | 'updated_at'>>
      }
      rfis: {
        Row: RFI
        Insert: Omit<RFI, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<RFI, 'id' | 'created_at' | 'updated_at'>>
      }
      change_orders: {
        Row: ChangeOrder
        Insert: Omit<ChangeOrder, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ChangeOrder, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      project_dashboard: {
        Row: {
          project_id: string
          project_name: string
          status: ProjectStatus
          completion_percentage: number
          total_tasks: number
          completed_tasks: number
          overdue_tasks: number
          total_scope_items: number
          completed_scope_items: number
          pending_drawings: number
          approved_drawings: number
        }
      }
      user_project_permissions: {
        Row: {
          user_id: string
          project_id: string
          permissions: Permission[]
          role_name: string
        }
      }
    }
    Functions: {
      get_user_permissions: {
        Args: {
          user_id: string
          project_id?: string
        }
        Returns: Permission[]
      }
      check_user_permission: {
        Args: {
          user_id: string
          permission: Permission
          project_id?: string
        }
        Returns: boolean
      }
      get_project_stats: {
        Args: {
          project_id: string
        }
        Returns: {
          total_tasks: number
          completed_tasks: number
          overdue_tasks: number
          completion_percentage: number
        }
      }
    }
    Enums: {
      project_status: ProjectStatus
      scope_category: ScopeCategory
      scope_status: ScopeStatus
      workflow_status: WorkflowStatus
      task_status: TaskStatus
      task_priority: TaskPriority
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface ProjectFilters {
  status?: ProjectStatus[]
  client_id?: string
  project_manager_id?: string
  date_range?: {
    start: string
    end: string
  }
}

export interface ScopeFilters {
  project_id?: string
  category?: ScopeCategory[]
  status?: ScopeStatus[]
  assigned_subcontractor_id?: string
}

export interface TaskFilters {
  project_id?: string
  assigned_to?: string
  status?: TaskStatus[]
  priority?: TaskPriority[]
  due_date_range?: {
    start: string
    end: string
  }
}