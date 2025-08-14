/**
 * Role-Specific Dashboard Components
 * Customized dashboard views based on user permissions and roles
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Briefcase, 
  Wrench, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  FileText,
  DollarSign,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react'
import { MetricsCards, ProjectStatusCard } from './MetricsCards'
import { 
  ProjectProgressChart, 
  BudgetAnalysisChart, 
  TaskStatusChart, 
  TimelinePerformanceChart,
  WeeklyProgressChart 
} from './ConstructionCharts'
import { ActivityFeed, CompactActivityFeed } from './ActivityFeed'
import { useDashboardData, useRoleSpecificData } from '@/hooks/useDashboardData'
import type { AppUserProfile } from '@/types/database'
import type { Permission } from '@/types/auth'

interface RoleSpecificDashboardProps {
  userProfile: AppUserProfile | null
}

// Ultra-modern quick action buttons with glassmorphism
function QuickActions({ permissions }: { permissions: Permission[] }) {
  const actions = []
  
  if (permissions.includes('create_projects')) {
    actions.push({
      label: 'New Project',
      icon: <Briefcase className="h-5 w-5" />,
      href: '/projects/new',
      gradient: 'from-blue-500/90 to-cyan-500/90',
      shadow: 'shadow-blue-500/25'
    })
  }
  
  if (permissions.includes('create_tasks')) {
    actions.push({
      label: 'Add Task',
      icon: <CheckCircle className="h-5 w-5" />,
      href: '/tasks/new',
      gradient: 'from-emerald-500/90 to-teal-500/90',
      shadow: 'shadow-emerald-500/25'
    })
  }
  
  if (permissions.includes('upload_drawings')) {
    actions.push({
      label: 'Upload Drawing',
      icon: <FileText className="h-5 w-5" />,
      href: '/drawings/upload',
      gradient: 'from-violet-500/90 to-purple-500/90',
      shadow: 'shadow-violet-500/25'
    })
  }
  
  if (permissions.includes('manage_change_orders')) {
    actions.push({
      label: 'Change Order',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/change-orders/new',
      gradient: 'from-orange-500/90 to-red-500/90',
      shadow: 'shadow-orange-500/25'
    })
  }

  if (actions.length === 0) return null

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">
          Quick Actions
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className={`group relative overflow-hidden rounded-xl p-4 h-24 bg-gradient-to-br ${action.gradient} ${action.shadow} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1`}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
              <div className="mb-2 p-2 rounded-lg bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </div>
            
            {/* Hover shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out" />
          </a>
        ))}
      </div>
    </div>
  )
}

// Ultra-modern Project Manager Dashboard
function ProjectManagerDashboard({ userProfile }: { userProfile: AppUserProfile }) {
  const { metrics, projects, activity, isLoading } = useDashboardData(userProfile)
  const roleData = useRoleSpecificData(userProfile)

  return (
    <div className="space-y-8">
      {/* Executive Summary - Bento Box Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Metrics take up more space */}
        <div className="xl:col-span-8">
          <MetricsCards 
            metrics={metrics.data} 
            isLoading={metrics.isLoading} 
            permissions={userProfile.permissions} 
          />
        </div>
        
        {/* Quick Actions - Premium glass card */}
        <div className="xl:col-span-4">
          <QuickActions permissions={userProfile.permissions} />
        </div>
      </div>

      {/* Project Overview Section */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-8 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">
                Project Progress Overview
              </h2>
            </div>
            <ProjectProgressChart 
              projects={projects.data} 
              isLoading={projects.isLoading} 
            />
          </div>
        </div>
        
        <div className="xl:col-span-2">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl h-full">
            <ProjectStatusCard 
              metrics={metrics.data} 
              isLoading={metrics.isLoading} 
            />
          </div>
        </div>
      </div>

      {/* Financial Analytics */}
      {userProfile.permissions.includes('view_project_budgets') && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Budget Analysis
              </h2>
            </div>
            <BudgetAnalysisChart isLoading={roleData.isLoading} />
          </div>
          
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-8 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
              <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Timeline Performance
              </h2>
            </div>
            <TimelinePerformanceChart isLoading={metrics.isLoading} />
          </div>
        </div>
      )}

      {/* Activity Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
        <div className="xl:col-span-5">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 rounded-full bg-gradient-to-b from-orange-500 to-red-500" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Recent Activity
                </h2>
              </div>
              <Badge className="bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-700 border-orange-200/30">
                Live Updates
              </Badge>
            </div>
            <ActivityFeed 
              activities={activity.data} 
              isLoading={activity.isLoading} 
            />
          </div>
        </div>
        
        <div className="xl:col-span-2">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-8 rounded-full bg-gradient-to-b from-pink-500 to-rose-500" />
              <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Task Status
              </h2>
            </div>
            <TaskStatusChart isLoading={metrics.isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Ultra-modern Field Operations Dashboard (Construction Site Focus)
function FieldOperationsDashboard({ userProfile }: { userProfile: AppUserProfile }) {
  const { metrics, activity, isLoading } = useDashboardData(userProfile)

  // Field-optimized metrics with modern styling
  const fieldMetrics = [
    {
      title: 'Today\'s Tasks',
      value: 12,
      subtitle: '8 completed',
      icon: <CheckCircle className="h-6 w-6" />,
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/25'
    },
    {
      title: 'Crew Hours',
      value: '184',
      subtitle: 'This week',
      icon: <Clock className="h-6 w-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/25'
    },
    {
      title: 'Safety Score',
      value: '100%',
      subtitle: 'No incidents',
      icon: <Shield className="h-6 w-6" />,
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-500/25'
    },
    {
      title: 'Weather Alert',
      value: 'Clear',
      subtitle: 'Good for work',
      icon: <AlertTriangle className="h-6 w-6" />,
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/25'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Field Operations Summary - Touch-optimized cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {fieldMetrics.map((metric, index) => (
          <div key={index} className="group relative">
            {/* Glassmorphism card */}
            <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl ${metric.shadow} hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-1`}>
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 rounded-2xl group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">{metric.title}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">{metric.value}</p>
                  <p className="text-xs text-gray-700">{metric.subtitle}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${metric.gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-Optimized Task Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Priority Tasks - Enhanced for tablets */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Today's Priority Tasks
                </h2>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200/30">
                {4} Active
              </Badge>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group relative overflow-hidden backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                  {/* Priority indicator */}\n                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r" />
                  
                  <div className="flex items-center gap-4 ml-3">
                    {/* Status dot */}
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 animate-pulse" />
                    
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-gray-900">Install drywall - Unit {i}A</p>
                      <div className="flex items-center gap-3 text-xs text-gray-700">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: 2:00 PM
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Team Alpha
                        </span>
                      </div>
                    </div>
                    
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/30">
                      <span className="text-xs font-medium text-orange-700">In Progress</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Updates - Streamlined */}
        <div className="lg:col-span-1">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
              <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Recent Updates
              </h2>
            </div>
            <CompactActivityFeed 
              activities={activity.data} 
              isLoading={activity.isLoading} 
            />
          </div>
        </div>
      </div>

      {/* Weekly Progress - Enhanced visualization */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Weekly Progress Overview
          </h2>
        </div>
        <WeeklyProgressChart isLoading={isLoading} />
      </div>
    </div>
  )
}

// Admin Dashboard (Company-wide View)
function AdminDashboard({ userProfile }: { userProfile: AppUserProfile }) {
  const { metrics, projects, isLoading } = useDashboardData(userProfile)
  const roleData = useRoleSpecificData(userProfile)

  return (
    <div className="space-y-6">
      {/* Company-wide Metrics */}
      <MetricsCards 
        metrics={metrics.data} 
        isLoading={metrics.isLoading} 
        permissions={userProfile.permissions} 
      />

      {/* Admin Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProjectProgressChart projects={projects.data} isLoading={projects.isLoading} />
            <BudgetAnalysisChart isLoading={roleData.isLoading} />
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimelinePerformanceChart isLoading={metrics.isLoading} />
                <TaskStatusChart isLoading={metrics.isLoading} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>User management interface coming soon</p>
                <Button className="mt-4" asChild>
                  <a href="/admin/users">Manage Users</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <WeeklyProgressChart isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Client Portal Dashboard (Simplified View)
function ClientDashboard({ userProfile }: { userProfile: AppUserProfile }) {
  const { metrics, projects, activity, isLoading } = useDashboardData(userProfile)

  return (
    <div className="space-y-6">
      {/* Client-specific simplified metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Projects</p>
                <p className="text-2xl font-bold">{projects.data?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{metrics.data?.completedProjects || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-orange-100">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{metrics.data?.pendingDrawings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress - Client View */}
      <ProjectProgressChart projects={projects.data} isLoading={projects.isLoading} />

      {/* Activity Feed */}
      <ActivityFeed activities={activity.data} isLoading={activity.isLoading} />
    </div>
  )
}

// Main role-specific dashboard router
export function RoleSpecificDashboard({ userProfile }: RoleSpecificDashboardProps) {
  if (!userProfile) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Authentication Required</p>
          <p className="text-muted-foreground">Please log in to access your dashboard</p>
        </CardContent>
      </Card>
    )
  }

  const { permissions } = userProfile

  // Determine dashboard type based on permissions
  const getDashboardType = (permissions: Permission[]) => {
    if (permissions.includes('manage_users')) return 'admin'
    if (permissions.includes('access_client_portal')) return 'client'
    if (permissions.includes('create_projects') && permissions.includes('view_project_budgets')) return 'project_manager'
    return 'field_operations'
  }

  const dashboardType = getDashboardType(permissions)

  const dashboardTitle = {
    admin: 'Company Dashboard',
    project_manager: 'Project Manager Dashboard',
    field_operations: 'Field Operations Dashboard',
    client: 'Client Portal Dashboard'
  }[dashboardType]

  return (
    <div className="space-y-8">
      {/* Ultra-modern Dashboard Header */}
      <div className="relative">
        {/* Background blur card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/30" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 bg-clip-text text-transparent">
                  {dashboardTitle}
                </h1>
              </div>
              <p className="text-lg text-gray-800 font-medium">
                Welcome back, <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold">{userProfile.full_name}</span>
              </p>
              <div className="text-sm text-gray-700">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/30 backdrop-blur-sm">
                <span className="text-sm font-medium bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
                  {userProfile.job_title}
                </span>
              </div>
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/30 backdrop-blur-sm">
                <span className="text-sm font-medium bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  {permissions.length} permissions
                </span>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-700">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render appropriate dashboard */}
      {dashboardType === 'admin' && <AdminDashboard userProfile={userProfile} />}
      {dashboardType === 'project_manager' && <ProjectManagerDashboard userProfile={userProfile} />}
      {dashboardType === 'field_operations' && <FieldOperationsDashboard userProfile={userProfile} />}
      {dashboardType === 'client' && <ClientDashboard userProfile={userProfile} />}
    </div>
  )
}