/**
 * Project Status Components for Construction Workflows
 * Optimized for quick visual recognition in field conditions
 * Mobile-first design with accessibility features
 */

'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Pause,
  Play,
  Clock3,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

// Construction project status types
export type ProjectStatus = 
  | 'planning'
  | 'active'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'delayed'

export type WorkflowStatus = 
  | 'draft'
  | 'pending'
  | 'in-review'
  | 'approved'
  | 'rejected'
  | 'implemented'

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical'

// Status configuration for construction context
const PROJECT_STATUS_CONFIG = {
  planning: {
    label: 'Planning',
    icon: Calendar,
    color: 'blue',
    bgClass: 'project-planning',
    description: 'Project in planning phase'
  },
  active: {
    label: 'Active',
    icon: Play,
    color: 'green',
    bgClass: 'project-active',
    description: 'Project actively under construction'
  },
  'on-hold': {
    label: 'On Hold',
    icon: Pause,
    color: 'yellow',
    bgClass: 'project-on-hold',
    description: 'Project temporarily paused'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'emerald',
    bgClass: 'project-completed',
    description: 'Project successfully completed'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'red',
    bgClass: 'project-on-hold',
    description: 'Project cancelled'
  },
  delayed: {
    label: 'Delayed',
    icon: AlertTriangle,
    color: 'orange',
    bgClass: 'project-on-hold',
    description: 'Project behind schedule'
  }
} as const

const WORKFLOW_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    icon: Clock3,
    color: 'gray',
    description: 'Item in draft state'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'yellow',
    description: 'Waiting for review or action'
  },
  'in-review': {
    label: 'In Review',
    icon: Users,
    color: 'blue',
    description: 'Currently under review'
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    color: 'green',
    description: 'Approved and ready to proceed'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'red',
    description: 'Rejected, requires revision'
  },
  implemented: {
    label: 'Implemented',
    icon: CheckCircle2,
    color: 'emerald',
    description: 'Successfully implemented'
  }
} as const

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'gray',
    icon: TrendingDown
  },
  medium: {
    label: 'Medium', 
    color: 'blue',
    icon: Clock
  },
  high: {
    label: 'High',
    color: 'orange',
    icon: TrendingUp
  },
  critical: {
    label: 'Critical',
    color: 'red',
    icon: AlertTriangle
  }
} as const

// Base status indicator props
interface StatusIndicatorProps {
  className?: string
  showIcon?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badge' | 'inline' | 'card'
}

// Project status indicator
interface ProjectStatusIndicatorProps extends StatusIndicatorProps {
  status: ProjectStatus
  tooltip?: boolean
  compact?: boolean
}

export function ProjectStatusIndicator({
  status,
  className,
  showIcon = true,
  showLabel = true,
  size = 'md',
  variant = 'badge',
  tooltip = false,
  compact = false
}: ProjectStatusIndicatorProps) {
  const config = PROJECT_STATUS_CONFIG[status]
  const Icon = config.icon
  
  const statusElement = (
    <div className={cn(
      'flex items-center gap-1.5',
      {
        'gap-1': size === 'sm',
        'gap-2': size === 'lg'
      },
      className
    )}>
      {showIcon && (
        <Icon className={cn(
          'flex-shrink-0',
          {
            'h-3 w-3': size === 'sm',
            'h-4 w-4': size === 'md',
            'h-5 w-5': size === 'lg'
          }
        )} />
      )}
      
      {showLabel && !compact && (
        <span className={cn(
          'font-medium whitespace-nowrap',
          {
            'text-xs': size === 'sm',
            'text-sm': size === 'md',
            'text-base': size === 'lg'
          }
        )}>
          {config.label}
        </span>
      )}
      
      {/* Status dot for compact mode */}\n      {compact && (\n        <div className={cn(\n          'status-dot',\n          `status-${status === 'active' ? 'completed' : \n           status === 'planning' ? 'in-progress' : \n           status === 'on-hold' || status === 'delayed' ? 'pending' : \n           status === 'cancelled' ? 'blocked' : 'completed'}`\n        )} />\n      )}\n    </div>\n  )\n  \n  if (variant === 'badge') {\n    const badgeElement = (\n      <Badge \n        variant=\"secondary\" \n        className={cn(\n          'construction-badge mobile-touch-target',\n          {\n            'text-blue-700 bg-blue-50 border-blue-200': config.color === 'blue',\n            'text-green-700 bg-green-50 border-green-200': config.color === 'green',\n            'text-yellow-700 bg-yellow-50 border-yellow-200': config.color === 'yellow',\n            'text-emerald-700 bg-emerald-50 border-emerald-200': config.color === 'emerald',\n            'text-red-700 bg-red-50 border-red-200': config.color === 'red',\n            'text-orange-700 bg-orange-50 border-orange-200': config.color === 'orange',\n          },\n          className\n        )}\n      >\n        {statusElement}\n      </Badge>\n    )\n    \n    if (tooltip) {\n      return (\n        <TooltipProvider>\n          <Tooltip>\n            <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>\n            <TooltipContent>\n              <p>{config.description}</p>\n            </TooltipContent>\n          </Tooltip>\n        </TooltipProvider>\n      )\n    }\n    \n    return badgeElement\n  }\n  \n  if (variant === 'card') {\n    return (\n      <Card className={cn(config.bgClass, className)}>\n        <CardContent className=\"p-4\">\n          {statusElement}\n        </CardContent>\n      </Card>\n    )\n  }\n  \n  // Inline variant\n  return statusElement\n}\n\n// Workflow status indicator\ninterface WorkflowStatusIndicatorProps extends StatusIndicatorProps {\n  status: WorkflowStatus\n  tooltip?: boolean\n  count?: number\n}\n\nexport function WorkflowStatusIndicator({\n  status,\n  className,\n  showIcon = true,\n  showLabel = true,\n  size = 'md',\n  variant = 'badge',\n  tooltip = false,\n  count\n}: WorkflowStatusIndicatorProps) {\n  const config = WORKFLOW_STATUS_CONFIG[status]\n  const Icon = config.icon\n  \n  const statusElement = (\n    <div className={cn(\n      'flex items-center gap-1.5',\n      {\n        'gap-1': size === 'sm',\n        'gap-2': size === 'lg'\n      }\n    )}>\n      {showIcon && (\n        <Icon className={cn(\n          'flex-shrink-0',\n          {\n            'h-3 w-3': size === 'sm',\n            'h-4 w-4': size === 'md',\n            'h-5 w-5': size === 'lg'\n          }\n        )} />\n      )}\n      \n      {showLabel && (\n        <span className={cn(\n          'font-medium whitespace-nowrap',\n          {\n            'text-xs': size === 'sm',\n            'text-sm': size === 'md',\n            'text-base': size === 'lg'\n          }\n        )}>\n          {config.label}\n        </span>\n      )}\n      \n      {count !== undefined && count > 0 && (\n        <span className={cn(\n          'ml-1 px-1.5 py-0.5 text-xs font-medium bg-white/20 rounded-full',\n          {\n            'text-xs': size === 'sm',\n            'text-sm': size !== 'sm'\n          }\n        )}>\n          {count}\n        </span>\n      )}\n    </div>\n  )\n  \n  if (variant === 'badge') {\n    const badgeElement = (\n      <Badge \n        variant=\"secondary\" \n        className={cn(\n          'construction-badge',\n          {\n            'text-gray-700 bg-gray-50 border-gray-200': config.color === 'gray',\n            'text-blue-700 bg-blue-50 border-blue-200': config.color === 'blue',\n            'text-yellow-700 bg-yellow-50 border-yellow-200': config.color === 'yellow',\n            'text-green-700 bg-green-50 border-green-200': config.color === 'green',\n            'text-red-700 bg-red-50 border-red-200': config.color === 'red',\n            'text-emerald-700 bg-emerald-50 border-emerald-200': config.color === 'emerald',\n          },\n          className\n        )}\n      >\n        {statusElement}\n      </Badge>\n    )\n    \n    if (tooltip) {\n      return (\n        <TooltipProvider>\n          <Tooltip>\n            <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>\n            <TooltipContent>\n              <p>{config.description}</p>\n            </TooltipContent>\n          </Tooltip>\n        </TooltipProvider>\n      )\n    }\n    \n    return badgeElement\n  }\n  \n  return statusElement\n}\n\n// Priority indicator\ninterface PriorityIndicatorProps extends StatusIndicatorProps {\n  priority: PriorityLevel\n  tooltip?: boolean\n}\n\nexport function PriorityIndicator({\n  priority,\n  className,\n  showIcon = true,\n  showLabel = true,\n  size = 'md',\n  variant = 'badge',\n  tooltip = false\n}: PriorityIndicatorProps) {\n  const config = PRIORITY_CONFIG[priority]\n  const Icon = config.icon\n  \n  const priorityElement = (\n    <div className={cn(\n      'flex items-center gap-1.5',\n      {\n        'gap-1': size === 'sm',\n        'gap-2': size === 'lg'\n      }\n    )}>\n      {showIcon && (\n        <Icon className={cn(\n          'flex-shrink-0',\n          {\n            'h-3 w-3': size === 'sm',\n            'h-4 w-4': size === 'md',\n            'h-5 w-5': size === 'lg'\n          }\n        )} />\n      )}\n      \n      {showLabel && (\n        <span className={cn(\n          'font-medium whitespace-nowrap',\n          {\n            'text-xs': size === 'sm',\n            'text-sm': size === 'md',\n            'text-base': size === 'lg'\n          }\n        )}>\n          {config.label}\n        </span>\n      )}\n    </div>\n  )\n  \n  if (variant === 'badge') {\n    const badgeElement = (\n      <Badge \n        variant=\"secondary\" \n        className={cn(\n          'construction-badge',\n          {\n            'text-gray-700 bg-gray-50 border-gray-200': config.color === 'gray',\n            'text-blue-700 bg-blue-50 border-blue-200': config.color === 'blue',\n            'text-orange-700 bg-orange-50 border-orange-200': config.color === 'orange',\n            'text-red-700 bg-red-50 border-red-200': config.color === 'red',\n          },\n          className\n        )}\n      >\n        {priorityElement}\n      </Badge>\n    )\n    \n    if (tooltip) {\n      return (\n        <TooltipProvider>\n          <Tooltip>\n            <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>\n            <TooltipContent>\n              <p>{priority.charAt(0).toUpperCase() + priority.slice(1)} priority</p>\n            </TooltipContent>\n          </Tooltip>\n        </TooltipProvider>\n      )\n    }\n    \n    return badgeElement\n  }\n  \n  return priorityElement\n}\n\n// Construction project overview status card\ninterface ProjectStatusCardProps {\n  project: {\n    name: string\n    status: ProjectStatus\n    progress: number\n    startDate?: Date\n    endDate?: Date\n    budget?: number\n    spent?: number\n    teamSize?: number\n  }\n  className?: string\n  compact?: boolean\n}\n\nexport function ProjectStatusCard({ \n  project, \n  className,\n  compact = false \n}: ProjectStatusCardProps) {\n  const progressPercent = Math.min(100, Math.max(0, project.progress))\n  const budgetPercent = project.budget && project.spent \n    ? (project.spent / project.budget) * 100 \n    : 0\n    \n  return (\n    <Card className={cn('construction-card', className)}>\n      <CardHeader className={cn('pb-3', compact && 'pb-2')}>\n        <div className=\"flex items-center justify-between\">\n          <CardTitle className={cn(\n            'text-lg font-semibold truncate',\n            compact && 'text-base'\n          )}>\n            {project.name}\n          </CardTitle>\n          <ProjectStatusIndicator \n            status={project.status} \n            size={compact ? 'sm' : 'md'}\n            tooltip\n          />\n        </div>\n      </CardHeader>\n      \n      <CardContent className={cn('space-y-3', compact && 'space-y-2')}>\n        {/* Progress bar */}\n        <div>\n          <div className=\"flex justify-between text-sm mb-1\">\n            <span className=\"text-muted-foreground\">Progress</span>\n            <span className=\"font-medium\">{progressPercent.toFixed(0)}%</span>\n          </div>\n          <div className=\"w-full bg-muted rounded-full h-2\">\n            <div \n              className=\"bg-primary rounded-full h-2 transition-all duration-300\"\n              style={{ width: `${progressPercent}%` }}\n            />\n          </div>\n        </div>\n        \n        {/* Project metrics */}\n        {!compact && (\n          <div className=\"grid grid-cols-2 gap-4 pt-2\">\n            {project.budget && (\n              <div className=\"space-y-1\">\n                <div className=\"flex items-center text-muted-foreground text-sm\">\n                  <DollarSign className=\"h-3 w-3 mr-1\" />\n                  Budget\n                </div>\n                <div className=\"font-medium\">\n                  ${(project.budget / 1000).toFixed(0)}k\n                  {project.spent && (\n                    <span className={cn(\n                      'text-sm ml-1',\n                      budgetPercent > 100 ? 'text-red-600' : 'text-muted-foreground'\n                    )}>\n                      ({budgetPercent.toFixed(0)}% used)\n                    </span>\n                  )}\n                </div>\n              </div>\n            )}\n            \n            {project.teamSize && (\n              <div className=\"space-y-1\">\n                <div className=\"flex items-center text-muted-foreground text-sm\">\n                  <Users className=\"h-3 w-3 mr-1\" />\n                  Team\n                </div>\n                <div className=\"font-medium\">{project.teamSize} members</div>\n              </div>\n            )}\n            \n            {project.endDate && (\n              <div className=\"space-y-1 col-span-2\">\n                <div className=\"flex items-center text-muted-foreground text-sm\">\n                  <Calendar className=\"h-3 w-3 mr-1\" />\n                  Target Completion\n                </div>\n                <div className=\"font-medium\">\n                  {project.endDate.toLocaleDateString()}\n                </div>\n              </div>\n            )}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  )\n}"