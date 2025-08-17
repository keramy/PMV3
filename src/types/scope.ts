/**
 * Formula PM V3 Scope Management Types
 * Enhanced scope management with Excel import/export and simplified V3 patterns
 */

import type { ScopeItem as DBScopeItem, Subcontractor, UserProfile } from './database'
import type { Permission } from './auth'

// ============================================================================
// CORE SCOPE TYPES (V3 ENHANCED)
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
  | 'planning' 
  | 'materials_ordered'
  | 'in_progress'
  | 'quality_check'
  | 'client_review' 
  | 'completed'
  | 'blocked'
  | 'on_hold'
  | 'cancelled'

export type RiskLevel = 'low' | 'medium' | 'high'

// Enhanced scope item with computed fields and relationships
export interface ScopeItem extends DBScopeItem {
  // Computed fields
  total_cost_formatted?: string
  progress_percentage?: number
  days_remaining?: number
  is_overdue?: boolean
  
  // Relationships (loaded separately)
  assigned_user?: Pick<UserProfile, 'id' | 'first_name' | 'last_name' | 'job_title'>
  subcontractor?: Pick<Subcontractor, 'id' | 'name' | 'trade' | 'email'>
  created_by_user?: Pick<UserProfile, 'first_name' | 'last_name'>
  
  // Excel import metadata
  import_batch_id?: string
  excel_row_number?: number
  validation_errors?: string[]
}

// ============================================================================
// FORM AND INPUT TYPES (V3 SIMPLIFIED)
// ============================================================================

export interface ScopeItemFormData {
  title: string
  description?: string
  category: ScopeCategory
  specification?: string
  quantity?: number
  unit?: string
  unit_cost?: number
  total_cost?: number
  start_date?: string
  end_date?: string
  priority?: string
  status?: ScopeStatus
  assigned_to?: string
  notes?: string
}

export interface ScopeItemUpdateData extends Partial<ScopeItemFormData> {
  // Update data for existing scope items
}

export interface BulkScopeUpdate {
  item_ids: string[]
  updates: Partial<ScopeItemUpdateData>
  update_type: 'status' | 'assignment' | 'timeline' | 'pricing'
}

// ============================================================================
// FILTERING AND SEARCH (V3)
// ============================================================================

export interface ScopeFilters {
  category?: ScopeCategory | 'all'
  status?: ScopeStatus[]
  assigned_to?: string[]
  priority?: string[]
  search_term?: string
  date_range?: {
    field: 'start_date' | 'end_date' | 'created_at'
    start?: string
    end?: string
  }
  cost_range?: {
    min?: number
    max?: number
  }
  overdue_only?: boolean
  // completion_range removed - not using completion percentage
}

export interface ScopeListParams {
  project_id: string
  filters?: ScopeFilters
  sort?: {
    field: keyof ScopeItem
    direction: 'asc' | 'desc'
  }
  page?: number
  limit?: number
}

// ============================================================================
// EXCEL IMPORT/EXPORT (V3 ENHANCED)
// ============================================================================

export interface ExcelImportColumn {
  excel_column: string
  field_name: keyof ScopeItemFormData
  field_type: 'string' | 'number' | 'date' | 'category' | 'status'
  required: boolean
  validation?: {
    min_value?: number
    max_value?: number
    allowed_values?: string[]
    max_length?: number
  }
}

export interface ExcelImportConfig {
  file: File
  project_id: string
  has_header_row: boolean
  start_row: number
  column_mappings: ExcelImportColumn[]
  default_values?: Partial<ScopeItemFormData>
}

export interface ExcelImportPreview {
  headers: string[]
  sample_rows: any[][]
  total_rows: number
  suggested_mappings: ExcelImportColumn[]
  validation_errors: ExcelValidationError[]
}

export interface ExcelValidationError {
  row_number: number
  column: string
  field_name: string
  error_type: 'required' | 'invalid_format' | 'invalid_value' | 'duplicate'
  error_message: string
  suggested_fix?: string
  cell_value?: any
}

export interface ExcelImportResult {
  import_batch_id: string
  total_rows: number
  successful_imports: number
  failed_imports: number
  created_items: ScopeItem[]
  validation_errors: ExcelValidationError[]
  warnings: string[]
}

export interface ExcelExportConfig {
  project_id: string
  include_columns: (keyof ScopeItem)[]
  filters?: ScopeFilters
  include_summary: boolean
  format_dates: boolean
  group_by_category: boolean
}

// ============================================================================
// STATISTICS AND REPORTING (V3)
// ============================================================================

export interface ScopeStatistics {
  total_items: number
  by_category: Record<ScopeCategory, {
    total: number
    completed: number
    in_progress: number
    not_started: number
    blocked: number
    // completion_percentage calculated as completed/total on frontend
    total_cost: number
  }>
  by_status: Record<ScopeStatus, number>
  timeline: {
    on_schedule: number
    behind_schedule: number
    overdue: number
    not_scheduled: number
  }
  financial: {
    total_budget: number
    average_item_cost: number
    highest_cost_item: number
    items_without_cost: number
  }
}

export interface ScopeProgressSummary {
  project_id: string
  overall_completion: number
  total_items: number
  completed_items: number
  in_progress_items: number
  blocked_items: number
  overdue_items: number
  upcoming_deadlines: Array<{
    item_id: string
    title: string
    end_date: string
    days_until_deadline: number
    assigned_to?: string
  }>
  category_progress: Record<ScopeCategory, {
    items_count: number
    completed_items: number
    total_cost: number
  }>
}

// ============================================================================
// API RESPONSE TYPES (V3)
// ============================================================================

export interface ScopeApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  validation_errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface ScopeListResponse {
  items: ScopeItem[]
  statistics: ScopeStatistics
  total_count: number
  filters_applied: ScopeFilters
}

// ============================================================================
// PERMISSIONS AND ACCESS (V3)
// ============================================================================

export interface ScopePermissions {
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_view_costs: boolean
  can_assign_subcontractors: boolean
  can_bulk_edit: boolean
  can_import_excel: boolean
  can_export_excel: boolean
}

// ============================================================================
// CONSTANTS AND CONFIGURATION (V3)
// ============================================================================

export const SCOPE_CATEGORIES: Record<ScopeCategory, {
  label: string
  description: string
  color: string
  icon: string
}> = {
  construction: {
    label: 'Construction',
    description: 'Structural and general construction',
    color: 'blue',
    icon: 'Building'
  },
  millwork: {
    label: 'Millwork', 
    description: 'Custom woodwork and cabinetry',
    color: 'amber',
    icon: 'Hammer'
  },
  electrical: {
    label: 'Electrical',
    description: 'Electrical systems and installations', 
    color: 'yellow',
    icon: 'Zap'
  },
  mechanical: {
    label: 'Mechanical',
    description: 'HVAC and mechanical systems',
    color: 'green',
    icon: 'Settings'
  },
  plumbing: {
    label: 'Plumbing',
    description: 'Plumbing and water systems',
    color: 'cyan',
    icon: 'Droplets'
  },
  hvac: {
    label: 'HVAC',
    description: 'Heating, ventilation, and air conditioning',
    color: 'indigo',
    icon: 'Wind'
  }
}

export const SCOPE_STATUSES: Record<ScopeStatus, {
  label: string
  color: string
  progress_weight: number
}> = {
  not_started: { label: 'Not Started', color: 'gray', progress_weight: 0 },
  planning: { label: 'Planning', color: 'blue', progress_weight: 10 },
  materials_ordered: { label: 'Materials Ordered', color: 'yellow', progress_weight: 25 },
  in_progress: { label: 'In Progress', color: 'green', progress_weight: 50 },
  quality_check: { label: 'Quality Check', color: 'purple', progress_weight: 75 },
  client_review: { label: 'Client Review', color: 'orange', progress_weight: 85 },
  completed: { label: 'Completed', color: 'emerald', progress_weight: 100 },
  blocked: { label: 'Blocked', color: 'red', progress_weight: 0 },
  on_hold: { label: 'On Hold', color: 'amber', progress_weight: 0 },
  cancelled: { label: 'Cancelled', color: 'gray', progress_weight: 0 }
}

export const DEFAULT_EXCEL_COLUMNS: ExcelImportColumn[] = [
  { excel_column: 'A', field_name: 'title', field_type: 'string', required: true, validation: { max_length: 255 } },
  { excel_column: 'B', field_name: 'description', field_type: 'string', required: false, validation: { max_length: 1000 } },
  { excel_column: 'C', field_name: 'category', field_type: 'category', required: true, validation: { allowed_values: Object.keys(SCOPE_CATEGORIES) } },
  { excel_column: 'D', field_name: 'quantity', field_type: 'number', required: false, validation: { min_value: 0 } },
  { excel_column: 'E', field_name: 'unit', field_type: 'string', required: false, validation: { max_length: 50 } },
  { excel_column: 'F', field_name: 'unit_cost', field_type: 'number', required: false, validation: { min_value: 0 } },
  { excel_column: 'G', field_name: 'start_date', field_type: 'date', required: false },
  { excel_column: 'H', field_name: 'end_date', field_type: 'date', required: false },
  { excel_column: 'I', field_name: 'priority', field_type: 'string', required: false, validation: { allowed_values: ['low', 'medium', 'high'] } },
  { excel_column: 'J', field_name: 'status', field_type: 'status', required: false, validation: { allowed_values: Object.keys(SCOPE_STATUSES) } }
]

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ScopeItemSummary = Pick<ScopeItem, 
  'id' | 'title' | 'category' | 'status' | 'assigned_to' | 'total_cost'
>

export type ScopeItemWithRelations = ScopeItem & {
  assigned_user?: Pick<UserProfile, 'id' | 'first_name' | 'last_name'>
  subcontractor?: Pick<Subcontractor, 'id' | 'name' | 'trade'>
  created_by_user?: Pick<UserProfile, 'first_name' | 'last_name'>
}

// Permission constants for scope management
export const SCOPE_PERMISSIONS: Record<string, Permission[]> = {
  VIEW: ['view_scope'],
  CREATE: ['view_scope', 'manage_scope_items'],
  EDIT: ['view_scope', 'manage_scope_items'],
  DELETE: ['view_scope', 'manage_scope_items'],
  ASSIGN_SUBCONTRACTORS: ['view_scope', 'assign_subcontractors'],
  BULK_OPERATIONS: ['view_scope', 'manage_scope_items'],
  EXCEL_IMPORT: ['view_scope', 'export_scope_excel'],
  EXCEL_EXPORT: ['view_scope', 'export_scope_excel'],
  VIEW_COSTS: ['view_scope', 'view_project_costs']
}