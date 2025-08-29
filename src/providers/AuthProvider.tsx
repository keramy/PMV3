/**
 * Formula PM V3 - Enhanced Authentication Provider with Bitwise Permissions
 * Single source of truth for auth state with high-performance permission checking
 * Based on official Supabase SSR patterns and React 18 best practices
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { getSupabaseSingleton } from '@/lib/supabase/singleton'
import { PermissionManager, PERMISSIONS, hasPermission, canViewCosts, isAdmin, canManageProject } from '@/lib/permissions/bitwise'
import type { User } from '@supabase/supabase-js'
import type { AppUserProfile } from '@/types/database'
import type { Permission } from '@/types/auth'
import type { Project } from '@/lib/permissions/bitwise'

interface AuthContextType {
  // Core auth state
  user: User | null
  profile: AppUserProfile | null
  loading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
  
  // Bitwise permission system
  permissions: number
  hasPermission: (permission: number) => boolean
  hasAnyPermission: (permissions: number[]) => boolean
  hasAllPermissions: (permissions: number[]) => boolean
  
  // Construction-specific permission checks
  canViewFinancials: boolean
  canManageProjects: boolean
  canManageUsers: boolean
  isAdmin: boolean
  isProjectOwner: (project: Project) => boolean
  canManageProject: (project: Project) => boolean
  canApproveShopDrawings: (project: Project, isProjectApprover?: boolean) => boolean
  
  // Data filtering
  filterFinancialData: <T extends Record<string, any>>(data: T[], costFields?: (keyof T)[]) => T[]
  
  // Role information
  roleDisplayName: string
  permissionNames: string[]
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(getSupabaseSingleton())
  const profileCacheRef = useRef<{ userId: string; profile: AppUserProfile | null; timestamp: number } | null>(null)

  const fetchUserProfile = async (userId: string, useCache: boolean = true, retryCount: number = 0): Promise<AppUserProfile | null> => {
    // Use cache if available and recent (within 5 seconds)
    const now = Date.now()
    if (useCache && profileCacheRef.current && 
        profileCacheRef.current.userId === userId && 
        (now - profileCacheRef.current.timestamp) < 5000) {
      console.log('🔐 AuthProvider: Using cached profile for user:', userId)
      return profileCacheRef.current.profile
    }
    
    try {
      console.log('🔐 AuthProvider: Fetching profile for user:', userId, retryCount > 0 ? `(retry ${retryCount})` : '')
      
      const { data, error } = await supabaseRef.current
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('🔐 AuthProvider: Profile fetch error:', error)
        
        // Retry on certain types of errors
        if (retryCount < 2 && (
          error.code === 'PGRST301' || // infinite recursion
          error.message?.includes('infinite recursion') ||
          error.message?.includes('policy') ||
          error.message?.includes('timeout')
        )) {
          console.log('🔐 AuthProvider: Retrying profile fetch due to policy error')
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
          return fetchUserProfile(userId, false, retryCount + 1)
        }
        
        return null
      }

      if (data) {
        const profile: AppUserProfile = {
          ...data,
          permissions: Array.isArray(data.permissions) ? data.permissions as Permission[] : [],
          permissions_bitwise: data.permissions_bitwise || 0, // Default to 0 if null
          full_name: [data.first_name, data.last_name].filter(Boolean).join(' ').trim() || 
                     (data.email ? data.email.split('@')[0] : 'User'),
          assigned_projects: data.assigned_projects || []
        }
        console.log('🔐 AuthProvider: Profile fetched successfully')
        
        // Cache the result
        profileCacheRef.current = {
          userId,
          profile,
          timestamp: Date.now()
        }
        
        return profile
      }

      // Cache null result too (but only for short time on policy errors)
      profileCacheRef.current = {
        userId,
        profile: null,
        timestamp: Date.now()
      }
      
      return null
    } catch (error: any) {
      console.error('🔐 AuthProvider: Profile fetch exception:', error)
      
      // Retry on RLS policy errors
      if (retryCount < 2 && (
        error.message?.includes('infinite recursion') ||
        error.message?.includes('policy') ||
        error.code === 'PGRST301'
      )) {
        console.log('🔐 AuthProvider: Retrying profile fetch due to exception')
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return fetchUserProfile(userId, false, retryCount + 1)
      }
      
      // Don't cache errors for too long
      profileCacheRef.current = {
        userId,
        profile: null,
        timestamp: Date.now() - 4000 // Cache for only 1 second on errors
      }
      
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const freshProfile = await fetchUserProfile(user.id, false) // Don't use cache for refresh
      setProfile(freshProfile)
    }
  }

  useEffect(() => {
    const supabase = supabaseRef.current

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('🔐 AuthProvider: Initial session error:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          const userProfile = await fetchUserProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Initial session exception:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Set up auth state listener - SINGLE LISTENER FOR ENTIRE APP
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthProvider: Auth state change:', event)
        
        try {
          if (session?.user) {
            console.log('🔐 AuthProvider: User authenticated:', session.user.email)
            setUser(session.user)
            const userProfile = await fetchUserProfile(session.user.id)
            setProfile(userProfile)
          } else {
            console.log('🔐 AuthProvider: User signed out or session expired')
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('🔐 AuthProvider: Auth state change error:', error)
          setUser(null)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      }
    )

    // Set up session refresh interval to prevent session expiry
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession()
        if (error) {
          console.warn('🔐 AuthProvider: Session refresh failed:', error.message)
          // Don't throw error - let auth state listener handle session expiry
        } else if (session?.user) {
          console.log('🔐 AuthProvider: Session refreshed successfully')
        }
      } catch (error) {
        console.warn('🔐 AuthProvider: Session refresh exception:', error)
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  // Bitwise permission computations
  const permissions = profile?.permissions_bitwise || 0;
  
  // Memoized permission checking functions for performance
  const permissionChecks = useMemo(() => ({
    hasPermission: (permission: number) => PermissionManager.hasPermission(permissions, permission),
    hasAnyPermission: (perms: number[]) => PermissionManager.hasAnyPermission(permissions, perms),
    hasAllPermissions: (perms: number[]) => PermissionManager.hasAllPermissions(permissions, perms),
    canViewFinancials: PermissionManager.canViewCosts(permissions),
    canManageProjects: PermissionManager.hasPermission(permissions, PERMISSIONS.MANAGE_ALL_PROJECTS),
    canManageUsers: PermissionManager.hasPermission(permissions, PERMISSIONS.MANAGE_ALL_USERS),
    isAdmin: PermissionManager.hasPermission(permissions, PERMISSIONS.MANAGE_ALL_USERS),
    permissionNames: PermissionManager.getPermissionNames(permissions)
  }), [permissions]);

  // Memoized callback functions
  const isProjectOwner = useCallback(
    (project: Project) => project.created_by === user?.id,
    [user?.id]
  );
  
  const canManageProjectCallback = useCallback(
    (project: Project) => PermissionManager.canManageProject(permissions, project, user?.id || ''),
    [permissions, user?.id]
  );
  
  const canApproveShopDrawings = useCallback(
    (project: Project, isProjectApprover?: boolean) => 
      PermissionManager.canApproveShopDrawings(permissions, project, user?.id || '', isProjectApprover),
    [permissions, user?.id]
  );
  
  const filterFinancialData = useCallback(
    <T extends Record<string, any>>(data: T[], costFields?: (keyof T)[]) => 
      PermissionManager.filterFinancialData(data, permissions, costFields),
    [permissions]
  );

  // Role display name
  const roleDisplayName = useMemo(() => {
    if (!profile?.role) return 'Unknown';
    
    const roleNames: Record<string, string> = {
      'admin': 'Administrator',
      'technical_manager': 'Technical Manager',  
      'project_manager': 'Project Manager',
      'team_member': 'Team Member',
      'client': 'Client',
      'accountant': 'Accountant'
    };
    
    return roleNames[profile.role] || profile.role;
  }, [profile?.role]);

  const value: AuthContextType = {
    // Core auth state
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    refreshProfile,
    
    // Bitwise permission system
    permissions,
    hasPermission: permissionChecks.hasPermission,
    hasAnyPermission: permissionChecks.hasAnyPermission,
    hasAllPermissions: permissionChecks.hasAllPermissions,
    
    // Construction-specific permission checks
    canViewFinancials: permissionChecks.canViewFinancials,
    canManageProjects: permissionChecks.canManageProjects,
    canManageUsers: permissionChecks.canManageUsers,
    isAdmin: permissionChecks.isAdmin,
    isProjectOwner,
    canManageProject: canManageProjectCallback,
    canApproveShopDrawings,
    
    // Data filtering
    filterFinancialData,
    
    // Role information
    roleDisplayName,
    permissionNames: permissionChecks.permissionNames
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}