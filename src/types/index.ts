/**
 * Formula PM V3 - Central Type Exports
 * All types available from single import
 * Now includes shared types and constants for consistency
 */

// Shared types (NEW - consolidated)
export type {
  Priority,
  BaseStatus,
  ConstructionCategory,
  PaginationParams,
  PaginationResponse,
  BaseFilters,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  UserReference,
  FullName,
  BaseFormFields,
  DateRangeFields,
  AssignmentFields,
  AuditFields,
  BaseStatistics,
  TimelineMetrics,
  ColorConfig,
  ValidationError,
  ValidationErrors,
  Optional,
  Required,
  KeysOfType
} from './shared'

// Shared constants (NEW - consolidated)
export { 
  PRIORITY_CONFIG,
  CONSTRUCTION_CATEGORY_CONFIG,
  BASE_STATUS_CONFIG,
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
  BASE_STATUS_OPTIONS,
  PAGINATION_DEFAULTS,
  COMMON_PERMISSIONS,
  DATE_FORMATS,
  FILE_CONSTANTS
} from '../lib/constants'

// Formatting utilities (NEW - consolidated)
export {
  formatDate,
  formatDateTime,
  formatInputDate,
  formatTime,
  formatDistanceToNow,
  isOverdue,
  calculateDaysBetween,
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  titleCase,
  truncateText,
  formatFullName,
  formatInitials,
  formatFileSize,
  isValidDate,
  isValidEmail,
  isValidPhone
} from '../lib/formatting'

// Styling utilities (Enhanced)
export {
  getStatusConfig,
  getPriorityConfig,
  getCategoryConfig,
  getStatusColor,
  getPriorityColor,
  getCategoryColor,
  getPriorityBadgeVariant,
  getPriorityBadgeProps,
  getCategoryBadgeProps,
  constructionStyles
} from '../lib/styling/construction-styles'

// Authentication types
export type {
  Permission,
  PermissionCategory,
  UserProfile,
  AuthUser,
  AuthContext,
  PermissionCheck,
  PermissionTemplate
} from './auth'

export { PERMISSION_TEMPLATES } from './auth'

// Database types (only exporting types that exist in generated schema)
export type {
  // Projects
  Project,
  ProjectStatus,
  
  // Scope management
  ScopeItem,
  ScopeCategory,
  ScopeStatus,
  
  // Workflows
  ShopDrawing,
  MaterialSpec,
  
  // Tasks
  Task,
  TaskStatus,
  TaskPriority,
  
  // RFIs & Change Orders
  RFI,
  ChangeOrder,
  
  // Company & Users
  Company,
  Subcontractor,
  
  // Other
  PunchItem,
  ActivityLog
} from './database'