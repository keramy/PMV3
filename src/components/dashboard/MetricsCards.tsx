/**
 * Construction Metrics Cards
 * Real-time KPI cards optimized for construction project management
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricCardSkeleton, ProjectStatusCardSkeleton } from '@/components/ui/loading-states'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  Wrench,
  Shield,
  CloudRain,
  Target
} from 'lucide-react'
import type { DashboardMetrics } from '@/hooks/useDashboardData'
import type { Permission } from '@/types/auth'

interface MetricsCardsProps {
  metrics?: DashboardMetrics
  isLoading: boolean
  permissions: Permission[]
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  isLoading?: boolean
}

function MetricCard({ title, value, subtitle, trend, icon, color, isLoading }: MetricCardProps) {
  if (isLoading) {
    return <MetricCardSkeleton />
  }

  const colorClasses = {
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-gray-100 text-gray-600'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricsCards({ metrics, isLoading, permissions }: MetricsCardsProps) {
  if (!metrics && !isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No metrics available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Core metrics visible to all users
  const coreMetrics = [
    {
      title: 'Active Projects',
      value: metrics?.activeProjects || 0,
      subtitle: `${metrics?.onTimeProjects || 0} on schedule`,
      icon: <Target className="h-5 w-5" />,
      color: 'primary' as const,
      trend: metrics ? {
        value: Math.round(((metrics.onTimeProjects / Math.max(metrics.activeProjects, 1)) - 0.8) * 100),
        isPositive: (metrics.onTimeProjects / Math.max(metrics.activeProjects, 1)) >= 0.8
      } : undefined
    },
    {
      title: 'Open Tasks',
      value: metrics?.openTasks || 0,
      subtitle: `${metrics?.overdueTasks || 0} overdue`,
      icon: <CheckCircle className="h-5 w-5" />,
      color: ((metrics?.overdueTasks || 0) > 0 ? 'warning' : 'success') as 'warning' | 'success',
      trend: metrics ? {
        value: Math.round((metrics.overdueTasks / Math.max(metrics.openTasks, 1)) * 100),
        isPositive: (metrics.overdueTasks / Math.max(metrics.openTasks, 1)) < 0.1
      } : undefined
    },
    {
      title: 'Pending Drawings',
      value: metrics?.pendingDrawings || 0,
      subtitle: `${metrics?.approvedDrawings || 0} approved this week`,
      icon: <Wrench className="h-5 w-5" />,
      color: ((metrics?.pendingDrawings || 0) > 10 ? 'warning' : 'info') as 'warning' | 'info',
    },
    {
      title: 'Upcoming Milestones',
      value: metrics?.upcomingMilestones || 0,
      subtitle: 'Next 30 days',
      icon: <Calendar className="h-5 w-5" />,
      color: 'primary' as const,
    }
  ]

  // Financial metrics for users with budget permissions
  const financialMetrics = permissions.includes('view_project_budgets') ? [
    {
      title: 'Total Budget',
      value: `$${((metrics?.totalBudget || 0) / 1000000).toFixed(1)}M`,
      subtitle: `$${((metrics?.actualSpend || 0) / 1000000).toFixed(1)}M spent`,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'success' as const,
      trend: metrics ? {
        value: Math.round(((metrics.actualSpend / Math.max(metrics.totalBudget, 1)) - 0.7) * 100),
        isPositive: (metrics.actualSpend / Math.max(metrics.totalBudget, 1)) <= 0.8
      } : undefined
    },
  ] : []

  // Safety metrics for supervisory roles
  const safetyMetrics = permissions.some(p => ['view_project_reports', 'manage_users'].includes(p)) ? [
    {
      title: 'Safety Score',
      value: metrics ? `${Math.max(0, 100 - (metrics.safetyIncidents * 5))}%` : '100%',
      subtitle: `${metrics?.safetyIncidents || 0} incidents this month`,
      icon: <Shield className="h-5 w-5" />,
      color: (metrics?.safetyIncidents || 0) === 0 ? 'success' : 'warning',
    },
  ] : []

  // Weather impact metrics
  const weatherMetrics = [
    {
      title: 'Weather Impact',
      value: `${metrics?.weatherDelayDays || 0} days`,
      subtitle: 'Weather delays this month',
      icon: <CloudRain className="h-5 w-5" />,
      color: (metrics?.weatherDelayDays || 0) > 5 ? 'warning' : 'info',
    }
  ]

  const allMetrics = [
    ...coreMetrics,
    ...financialMetrics,
    ...safetyMetrics,
    ...weatherMetrics
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {allMetrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
          trend={'trend' in metric ? metric.trend : undefined}
          icon={metric.icon}
          color={metric.color as 'primary' | 'success' | 'warning' | 'danger' | 'info'}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}

// Project status overview card
export function ProjectStatusCard({ 
  metrics, 
  isLoading 
}: { 
  metrics?: DashboardMetrics
  isLoading: boolean 
}) {
  if (isLoading) {
    return <ProjectStatusCardSkeleton />
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Project status unavailable</p>
        </CardContent>
      </Card>
    )
  }

  const total = metrics.activeProjects + metrics.completedProjects
  const completionRate = total > 0 ? Math.round((metrics.completedProjects / total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Project Portfolio Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Projects</span>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {metrics.activeProjects}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">On Schedule</span>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {metrics.onTimeProjects}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Delayed</span>
            <Badge variant="outline" className="text-red-600 border-red-200">
              {metrics.delayedProjects}
            </Badge>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Portfolio Health</span>
              <span className="text-sm font-bold">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${completionRate >= 80 ? 'bg-green-500' : completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}