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

// Quick action buttons based on role
function QuickActions({ permissions }: { permissions: Permission[] }) {
  const actions = []
  
  if (permissions.includes('create_projects')) {
    actions.push({
      label: 'New Project',
      icon: <Briefcase className="h-4 w-4" />,
      href: '/projects/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    })
  }
  
  if (permissions.includes('create_tasks')) {
    actions.push({
      label: 'Add Task',
      icon: <CheckCircle className="h-4 w-4" />,
      href: '/tasks/new',
      color: 'bg-green-500 hover:bg-green-600'
    })
  }
  
  if (permissions.includes('upload_drawings')) {
    actions.push({
      label: 'Upload Drawing',
      icon: <FileText className="h-4 w-4" />,
      href: '/drawings/upload',
      color: 'bg-purple-500 hover:bg-purple-600'
    })
  }
  
  if (permissions.includes('manage_change_orders')) {
    actions.push({
      label: 'Change Order',
      icon: <DollarSign className="h-4 w-4" />,
      href: '/change-orders/new',
      color: 'bg-orange-500 hover:bg-orange-600'
    })
  }

  if (actions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-20 flex-col gap-2 text-white border-0 ${action.color}`}
              asChild
            >
              <a href={action.href}>
                {action.icon}
                <span className="text-sm">{action.label}</span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Project Manager Dashboard
function ProjectManagerDashboard({ userProfile }: { userProfile: AppUserProfile }) {
  const { metrics, projects, activity, isLoading } = useDashboardData(userProfile)
  const roleData = useRoleSpecificData(userProfile)

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <MetricsCards 
            metrics={metrics.data} 
            isLoading={metrics.isLoading} 
            permissions={userProfile.permissions} 
          />
        </div>
        <div className="xl:col-span-1">
          <QuickActions permissions={userProfile.permissions} />
        </div>
      </div>

      {/* Project Overview and Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProjectProgressChart 
            projects={projects.data} 
            isLoading={projects.isLoading} 
          />
        </div>
        <div className="xl:col-span-1">
          <ProjectStatusCard 
            metrics={metrics.data} 
            isLoading={metrics.isLoading} 
          />
        </div>
      </div>

      {/* Financial and Performance */}
      {userProfile.permissions.includes('view_project_budgets') && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BudgetAnalysisChart isLoading={roleData.isLoading} />
          <TimelinePerformanceChart isLoading={metrics.isLoading} />
        </div>
      )}

      {/* Activity and Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ActivityFeed 
            activities={activity.data} 
            isLoading={activity.isLoading} 
          />
        </div>
        <div className="xl:col-span-1">
          <TaskStatusChart isLoading={metrics.isLoading} />
        </div>
      </div>
    </div>
  )
}

// Superintendent/Foreman Dashboard (Field Operations Focus)
function FieldOperationsDashboard({ userProfile }: { userProfile: AppUserProfile }) {
  const { metrics, activity, isLoading } = useDashboardData(userProfile)

  // Simplified metrics for field operations
  const fieldMetrics = [
    {
      title: 'Today\'s Tasks',
      value: 12,
      subtitle: '8 completed',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'success' as const
    },
    {
      title: 'Crew Hours',
      value: '184',
      subtitle: 'This week',
      icon: <Clock className="h-5 w-5" />,
      color: 'primary' as const
    },
    {
      title: 'Safety Score',
      value: '100%',
      subtitle: 'No incidents',
      icon: <Shield className="h-5 w-5" />,
      color: 'success' as const
    },
    {
      title: 'Weather Alert',
      value: 'Clear',
      subtitle: 'Good for work',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'info' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Field Operations Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fieldMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile-First Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Work */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Today's Priority Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Install drywall - Unit {i}A</p>
                    <p className="text-xs text-muted-foreground">Due: 2:00 PM • Crew: Team Alpha</p>
                  </div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Compact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompactActivityFeed 
              activities={activity.data} 
              isLoading={activity.isLoading} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <WeeklyProgressChart isLoading={isLoading} />
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
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {dashboardTitle}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {userProfile.full_name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {userProfile.job_title}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {permissions.length} permissions
          </Badge>
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