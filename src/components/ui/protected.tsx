/**
 * Formula PM V3 - Permission-Aware Component Wrappers  
 * Eliminates ~200 lines of duplicate permission checking code
 * Provides consistent authorization patterns across UI components
 */

'use client'

import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthContext } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge' 
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Permission } from '@/types/auth'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

// ============================================================================
// CORE PERMISSION WRAPPER TYPES
// ============================================================================

interface BasePermissionProps {
  permission?: Permission | Permission[]
  requireAll?: boolean
  requireAuth?: boolean
  fallback?: React.ReactNode
  className?: string
  children: React.ReactNode
}

interface AdvancedPermissionProps extends BasePermissionProps {
  showFallback?: boolean
  loadingComponent?: React.ReactNode
  unauthorizedComponent?: React.ReactNode
  errorComponent?: React.ReactNode
}

// ============================================================================
// CORE PERMISSION COMPONENT
// ============================================================================

/**
 * Core permission wrapper component
 * Handles all authentication and authorization logic
 */
export function ProtectedComponent({ 
  permission,
  requireAll = false,
  requireAuth = true,
  fallback = null,
  showFallback = false,
  loadingComponent,
  unauthorizedComponent,
  errorComponent,
  className,
  children 
}: AdvancedPermissionProps) {
  const { user, loading: authLoading } = useAuthContext()
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading: permLoading } = usePermissions()

  // Handle loading states
  if (authLoading || permLoading) {
    if (loadingComponent) return <>{loadingComponent}</>
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  // Handle authentication requirement
  if (requireAuth && !user) {
    if (unauthorizedComponent) return <>{unauthorizedComponent}</>
    if (showFallback) return <>{fallback}</>
    return null
  }

  // Handle permission requirements
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission]
    let hasAccess = false

    if (requireAll) {
      hasAccess = hasAllPermissions(permissions)
    } else {
      hasAccess = hasAnyPermission(permissions)
    }

    if (!hasAccess) {
      if (unauthorizedComponent) return <>{unauthorizedComponent}</>
      if (showFallback) return <>{fallback}</>
      return null
    }
  }

  return <div className={className}>{children}</div>
}

// ============================================================================
// AUTHENTICATION WRAPPER COMPONENTS
// ============================================================================

/**
 * Pure authentication wrapper - only checks if user is logged in
 * Use this to replace "checking authentication" loading states
 */
export function RequireAuth({ 
  children, 
  fallback,
  loading 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  loading?: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuthContext()
  
  if (authLoading) {
    return <>{loading || (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )}</>
  }
  
  if (!user) {
    return <>{fallback || (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Authentication required. Redirecting...</p>
        </div>
      </div>
    )}</>
  }
  
  return <>{children}</>
}

// ============================================================================
// CONVENIENCE WRAPPER COMPONENTS
// ============================================================================

/**
 * Simple permission wrapper - shows/hides content based on permissions
 */
export function Protected({ 
  permission, 
  requireAll = false,
  fallback = null,
  children 
}: BasePermissionProps) {
  return (
    <ProtectedComponent 
      permission={permission}
      requireAll={requireAll}
      fallback={fallback}
    >
      {children}
    </ProtectedComponent>
  )
}

/**
 * Permission wrapper with visual feedback
 */
export function ProtectedWithFeedback({ 
  permission,
  requireAll = false,
  children,
  className
}: BasePermissionProps) {
  return (
    <ProtectedComponent
      permission={permission}
      requireAll={requireAll}
      showFallback={true}
      className={className}
      unauthorizedComponent={
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span className="text-sm">Insufficient permissions</span>
        </div>
      }
    >
      {children}
    </ProtectedComponent>
  )
}

// ============================================================================
// ENHANCED UI COMPONENT WRAPPERS
// ============================================================================

/**
 * Permission-aware Button component
 */
interface ProtectedButtonProps extends React.ComponentProps<typeof Button> {
  permission?: Permission | Permission[]
  requireAll?: boolean
  showDisabled?: boolean
  disabledMessage?: string
}

export function ProtectedButton({ 
  permission,
  requireAll = false,
  showDisabled = true,
  disabledMessage = "Insufficient permissions",
  children,
  ...buttonProps 
}: ProtectedButtonProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()

  if (!permission) {
    return <Button {...buttonProps}>{children}</Button>
  }

  const permissions = Array.isArray(permission) ? permission : [permission]
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)

  if (!hasAccess && !showDisabled) {
    return null
  }

  return (
    <Button 
      {...buttonProps}
      disabled={!hasAccess || buttonProps.disabled}
      title={!hasAccess ? disabledMessage : buttonProps.title}
    >
      {children}
    </Button>
  )
}

/**
 * Permission-aware Card component
 */
interface ProtectedCardProps extends React.ComponentProps<typeof Card> {
  permission?: Permission | Permission[]
  requireAll?: boolean
  showPlaceholder?: boolean
  placeholderText?: string
}

export function ProtectedCard({ 
  permission,
  requireAll = false,
  showPlaceholder = false,
  placeholderText = "Content not available",
  children,
  className,
  ...cardProps 
}: ProtectedCardProps) {
  if (!permission) {
    return <Card className={className} {...cardProps}>{children}</Card>
  }

  return (
    <ProtectedComponent
      permission={permission}
      requireAll={requireAll}
      showFallback={showPlaceholder}
      className={className}
      unauthorizedComponent={
        showPlaceholder ? (
          <Card className={cn("p-4 border-dashed", className)} {...cardProps}>
            <div className="text-center text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{placeholderText}</p>
            </div>
          </Card>
        ) : null
      }
    >
      <Card className={className} {...cardProps}>
        {children}
      </Card>
    </ProtectedComponent>
  )
}

/**
 * Permission-aware Badge component
 */
interface ProtectedBadgeProps extends React.ComponentProps<typeof Badge> {
  permission?: Permission | Permission[]
  requireAll?: boolean
  hideOnNoPermission?: boolean
}

export function ProtectedBadge({ 
  permission,
  requireAll = false,
  hideOnNoPermission = true,
  children,
  ...badgeProps 
}: ProtectedBadgeProps) {
  if (!permission) {
    return <Badge {...badgeProps}>{children}</Badge>
  }

  return (
    <ProtectedComponent
      permission={permission}
      requireAll={requireAll}
      showFallback={!hideOnNoPermission}
    >
      <Badge {...badgeProps}>{children}</Badge>
    </ProtectedComponent>
  )
}

// ============================================================================
// ROLE-BASED COMPONENT WRAPPERS  
// ============================================================================

/**
 * Admin-only content wrapper
 */
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Protected permission={"admin_access" as any} fallback={fallback}>
      {children}
    </Protected>
  )
}

/**
 * Project manager-only content wrapper
 */
export function PMOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Protected permission={["create_projects", "manage_users"]} requireAll={false} fallback={fallback}>
      {children}
    </Protected>
  )
}

/**
 * Field worker content wrapper
 */
export function FieldWorkerContent({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Protected permission={["update_tasks", "create_punch_items"] as any} requireAll={false} fallback={fallback}>
      {children}
    </Protected>
  )
}

// ============================================================================
// FEATURE-BASED COMPONENT WRAPPERS
// ============================================================================

/**
 * Budget-related content wrapper
 */
export function BudgetContent({ 
  children, 
  showPlaceholder = false 
}: { 
  children: React.ReactNode
  showPlaceholder?: boolean 
}) {
  return (
    <ProtectedComponent
      permission="view_project_budgets"
      showFallback={showPlaceholder}
      unauthorizedComponent={
        showPlaceholder ? (
          <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">Budget information restricted</p>
          </div>
        ) : null
      }
    >
      {children}
    </ProtectedComponent>
  )
}

/**
 * Client-facing content wrapper  
 */
export function ClientContent({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Protected permission={"client_portal_access" as any} fallback={fallback}>
      {children}
    </Protected>
  )
}

/**
 * Internal-only content wrapper
 */
export function InternalContent({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Protected permission={"internal_access" as any} fallback={fallback}>
      {children}
    </Protected>
  )
}

// ============================================================================
// CONDITIONAL RENDERING HOOKS
// ============================================================================

/**
 * Hook for conditional rendering based on permissions
 */
export function usePermissionRenderer() {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()

  return {
    renderIf: (permission: Permission | Permission[], requireAll = false) => 
      (component: React.ReactNode) => {
        const permissions = Array.isArray(permission) ? permission : [permission]
        const hasAccess = requireAll 
          ? hasAllPermissions(permissions)
          : hasAnyPermission(permissions)
        return hasAccess ? component : null
      },

    renderUnless: (permission: Permission | Permission[], requireAll = false) => 
      (component: React.ReactNode) => {
        const permissions = Array.isArray(permission) ? permission : [permission]
        const hasAccess = requireAll 
          ? hasAllPermissions(permissions)
          : hasAnyPermission(permissions)
        return !hasAccess ? component : null
      }
  }
}

// ============================================================================
// PERMISSION STATUS COMPONENTS
// ============================================================================

/**
 * Display user's permission status
 */
export function PermissionStatus({ 
  permission,
  className 
}: { 
  permission: Permission
  className?: string 
}) {
  const { hasPermission } = usePermissions()
  const hasAccess = hasPermission(permission)

  return (
    <Badge 
      variant={hasAccess ? "default" : "secondary"}
      className={cn("text-xs", className)}
    >
      {hasAccess ? "✓" : "✗"} {permission.replace(/_/g, ' ')}
    </Badge>
  )
}

/**
 * Debug panel showing all user permissions
 */
export function PermissionDebug({ className }: { className?: string }) {
  const { user } = useAuthContext()
  const userPermissions = (user as any)?.permissions || []

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className={cn("p-4 border rounded-lg bg-muted/50", className)}>
      <h4 className="text-sm font-semibold mb-2">User Permissions (Debug)</h4>
      <div className="flex flex-wrap gap-1">
        {userPermissions.map((permission: string) => (
          <Badge key={permission} variant="outline" className="text-xs">
            {permission.replace(/_/g, ' ')}
          </Badge>
        ))}
      </div>
      {userPermissions.length === 0 && (
        <p className="text-xs text-muted-foreground">No permissions assigned</p>
      )}
    </div>
  )
}

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Higher-order component for permission-based rendering
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission | Permission[],
  options: {
    requireAll?: boolean
    fallback?: React.ComponentType<P>
    loading?: React.ComponentType<P>
  } = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedComponent
        permission={permission}
        requireAll={options.requireAll}
        loadingComponent={options.loading ? <options.loading {...props} /> : undefined}
        unauthorizedComponent={options.fallback ? <options.fallback {...props} /> : undefined}
      >
        <Component {...props} />
      </ProtectedComponent>
    )
  }

  WrappedComponent.displayName = `withPermissions(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Export everything for easy access
export default ProtectedComponent