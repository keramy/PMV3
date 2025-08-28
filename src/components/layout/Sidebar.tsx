'use client'

import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard,
  Building2, 
  FileText, 
  Package, 
  CheckSquare, 
  ClipboardList,
  Menu,
  X,
  Shield,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { LogoIcon, LogoText } from '@/components/ui/logo'
import { usePermissionsEnhanced } from '@/hooks/usePermissionsEnhanced'
import { ProjectSelector } from '@/components/navigation/ProjectSelector'
import { useProject } from '@/providers/ProjectProvider'
import { useAuthContext } from '@/providers/AuthProvider'
import { getSupabaseSingleton } from '@/lib/supabase/singleton'

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ activeView, setActiveView, isCollapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter()
  const { profile } = useAuthContext()
  const supabase = getSupabaseSingleton()
  
  // Use permissions hook with safe fallback for SSR
  let permissions = null
  let isAdmin = false
  let loading = true
  
  try {
    const permissionsHook = usePermissionsEnhanced()
    permissions = permissionsHook
    isAdmin = permissionsHook.isAdmin
    loading = permissionsHook.loading
  } catch (error) {
    // Fallback during SSR or when AuthProvider is not available
    console.warn('Permissions hook not available during SSR, using fallback state')
    permissions = null
    isAdmin = false
    loading = false
  }
  
  // Use project context with safe fallback
  let project = null
  try {
    const projectContext = useProject()
    project = projectContext.project
  } catch (error) {
    // Fallback when ProjectProvider is not available
    console.warn('ProjectProvider not available, using fallback state')
    project = null
  }
  
  // Logout handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  // GLOBAL section - Always available
  const globalMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
      href: '/dashboard'
    },
    {
      id: 'projects',
      label: 'All Projects',
      icon: Building2,
      description: 'Projects overview',
      href: '/projects'
    }
  ]

  // PROJECT section - Context-aware based on selected project
  const projectMenuItems = [
    {
      id: 'scope',
      label: 'Scope',
      icon: ClipboardList,
      description: 'Project scope items',
      href: project ? `/projects/${project.id}` : '/scope'
    },
    {
      id: 'shop-drawings',
      label: 'Drawings',
      icon: FileText,
      description: 'Whose Turn system',
      href: project ? `/projects/${project.id}` : '/shop-drawings'
    },
    {
      id: 'material-specs',
      label: 'Materials',
      icon: Package,
      description: 'PM approval workflow',
      href: project ? `/projects/${project.id}` : '/material-specs'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Task management',
      href: project ? `/projects/${project.id}` : '/tasks'
    }
  ]

  // Add admin menu item to global section if user is admin
  const adminMenuItem = isAdmin ? {
    id: 'admin',
    label: 'User Management',
    icon: Shield,
    description: 'Admin panel',
    href: '/admin/users'
  } : null

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="relative border-b px-4 py-4">
        {/* Toggle Button - Always in top-right corner */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onToggleCollapse}
          className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>

        {/* Logo Content - Centered vertically */}
        <div className={cn(
          "flex items-center justify-center min-h-[32px]",
          !isCollapsed && "pr-10"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <LogoText size="sm" />
              <span className="text-xs text-gray-700">v3.0</span>
            </div>
          ) : (
            <LogoIcon size="sm" />
          )}
        </div>
      </div>

      {/* Project Selector - Only show when not collapsed and provider is available */}
      {!isCollapsed && project !== undefined && (
        <div className="border-b px-3 py-3">
          <ProjectSelector 
            className="w-full" 
            placeholder="Select project..."
            showSearch={false}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {/* GLOBAL Section */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Global
              </p>
            </div>
          )}
          
          {globalMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  "justify-start gap-3",
                  isCollapsed ? "w-full px-2" : "w-full px-3",
                  isActive && 'bg-secondary'
                )}
                onClick={() => {
                  setActiveView(item.id)
                  router.push(item.href)
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Button>
            )
          })}
          
          {/* Admin menu item in global section */}
          {adminMenuItem && (
            <Button
              key={adminMenuItem.id}
              variant={activeView === adminMenuItem.id ? 'secondary' : 'ghost'}
              className={cn(
                "justify-start gap-3",
                isCollapsed ? "w-full px-2" : "w-full px-3",
                activeView === adminMenuItem.id && 'bg-secondary'
              )}
              onClick={() => {
                setActiveView(adminMenuItem.id)
                router.push(adminMenuItem.href)
              }}
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{adminMenuItem.label}</span>
              )}
            </Button>
          )}
        </div>

        {/* PROJECT Section */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <div className="px-3 py-2 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {project ? `Project: ${project.name}` : 'Project Context'}
              </p>
            </div>
          )}
          
          {projectMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            const isDisabled = !project && item.href.includes('/projects/')
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  "justify-start gap-3",
                  isCollapsed ? "w-full px-2" : "w-full px-3",
                  isActive && 'bg-secondary',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    setActiveView(item.id)
                    router.push(item.href)
                  }
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-3">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                {profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}` : 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User' : 'User'}
                </p>
                <p className="text-xs text-muted-foreground">{profile?.role || 'Member'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                {profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}` : 'U'}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full p-2 justify-center"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}