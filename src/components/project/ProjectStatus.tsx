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
      
      {/* Status dot for compact mode */}
      {compact && (
        <div className={cn(
          'status-dot',
          `status-${status === 'active' ? 'completed' : 
           status === 'planning' ? 'in-progress' : 
           status === 'on-hold' || status === 'delayed' ? 'pending' : 
           status === 'cancelled' ? 'blocked' : 'completed'}`
        )} />
      )}
    </div>
  )
  
  if (variant === 'badge') {
    const badgeElement = (
      <Badge 
        variant="secondary" 
        className={cn(
          'construction-badge mobile-touch-target',
          {
            'text-blue-700 bg-blue-50 border-blue-200': config.color === 'blue',
            'text-green-700 bg-green-50 border-green-200': config.color === 'green',
            'text-yellow-700 bg-yellow-50 border-yellow-200': config.color === 'yellow',
            'text-emerald-700 bg-emerald-50 border-emerald-200': config.color === 'emerald',
            'text-red-700 bg-red-50 border-red-200': config.color === 'red',
            'text-orange-700 bg-orange-50 border-orange-200': config.color === 'orange',
          },
          className
        )}
      >
        {statusElement}
      </Badge>
    )
    
    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
            <TooltipContent>
              <p>{config.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    
    return badgeElement
  }
  
  if (variant === 'card') {
    return (
      <Card className={cn(config.bgClass, className)}>
        <CardContent className="p-4">
          {statusElement}
        </CardContent>
      </Card>
    )
  }
  
  // Inline variant
  return statusElement
}

// Workflow status indicator
interface WorkflowStatusIndicatorProps extends StatusIndicatorProps {
  status: WorkflowStatus
  tooltip?: boolean
  count?: number
}

export function WorkflowStatusIndicator({
  status,
  className,
  showIcon = true,
  showLabel = true,
  size = 'md',
  variant = 'badge',
  tooltip = false,
  count
}: WorkflowStatusIndicatorProps) {
  const config = WORKFLOW_STATUS_CONFIG[status]
  const Icon = config.icon
  
  const statusElement = (
    <div className={cn(
      'flex items-center gap-1.5',
      {
        'gap-1': size === 'sm',
        'gap-2': size === 'lg'
      }
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
      
      {showLabel && (
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
      
      {count !== undefined && count > 0 && (
        <span className={cn(
          'ml-1 px-1.5 py-0.5 text-xs font-medium bg-white/20 rounded-full',
          {
            'text-xs': size === 'sm',
            'text-sm': size !== 'sm'
          }
        )}>
          {count}
        </span>
      )}
    </div>
  )
  
  if (variant === 'badge') {
    const badgeElement = (
      <Badge 
        variant="secondary" 
        className={cn(
          'construction-badge',
          {
            'text-gray-800 bg-gray-100 border-gray-400': config.color === 'gray',
            'text-blue-700 bg-blue-50 border-blue-200': config.color === 'blue',
            'text-yellow-700 bg-yellow-50 border-yellow-200': config.color === 'yellow',
            'text-green-700 bg-green-50 border-green-200': config.color === 'green',
            'text-red-700 bg-red-50 border-red-200': config.color === 'red',
            'text-emerald-700 bg-emerald-50 border-emerald-200': config.color === 'emerald',
          },
          className
        )}
      >
        {statusElement}
      </Badge>
    )
    
    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
            <TooltipContent>
              <p>{config.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    
    return badgeElement
  }
  
  return statusElement
}

// Priority indicator
interface PriorityIndicatorProps extends StatusIndicatorProps {
  priority: PriorityLevel
  tooltip?: boolean
}

export function PriorityIndicator({
  priority,
  className,
  showIcon = true,
  showLabel = true,
  size = 'md',
  variant = 'badge',
  tooltip = false
}: PriorityIndicatorProps) {
  const config = PRIORITY_CONFIG[priority]
  const Icon = config.icon
  
  const priorityElement = (
    <div className={cn(
      'flex items-center gap-1.5',
      {
        'gap-1': size === 'sm',
        'gap-2': size === 'lg'
      }
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
      
      {showLabel && (
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
    </div>
  )
  
  if (variant === 'badge') {
    const badgeElement = (
      <Badge 
        variant="secondary" 
        className={cn(
          'construction-badge',
          {
            'text-gray-800 bg-gray-100 border-gray-400': config.color === 'gray',
            'text-blue-700 bg-blue-50 border-blue-200': config.color === 'blue',
            'text-orange-700 bg-orange-50 border-orange-200': config.color === 'orange',
            'text-red-700 bg-red-50 border-red-200': config.color === 'red',
          },
          className
        )}
      >
        {priorityElement}
      </Badge>
    )
    
    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
            <TooltipContent>
              <p>{priority.charAt(0).toUpperCase() + priority.slice(1)} priority</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    
    return badgeElement
  }
  
  return priorityElement
}

// Construction project overview status card
interface ProjectStatusCardProps {
  project: {
    name: string
    status: ProjectStatus
    progress: number
    startDate?: Date
    endDate?: Date
    budget?: number
    spent?: number
    teamSize?: number
  }
  className?: string
  compact?: boolean
}

export function ProjectStatusCard({ 
  project, 
  className,
  compact = false 
}: ProjectStatusCardProps) {
  const progressPercent = Math.min(100, Math.max(0, project.progress))
  const budgetPercent = project.budget && project.spent 
    ? (project.spent / project.budget) * 100 
    : 0
    
  return (
    <Card className={cn('construction-card', className)}>
      <CardHeader className={cn('pb-3', compact && 'pb-2')}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            'text-lg font-semibold truncate',
            compact && 'text-base'
          )}>
            {project.name}
          </CardTitle>
          <ProjectStatusIndicator 
            status={project.status} 
            size={compact ? 'sm' : 'md'}
            tooltip
          />
        </div>
      </CardHeader>
      
      <CardContent className={cn('space-y-3', compact && 'space-y-2')}>
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Progress</span>
            <span className="font-medium">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        
        {/* Project metrics */}
        {!compact && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            {project.budget && (
              <div className="space-y-1">
                <div className="flex items-center text-gray-700 text-sm">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Budget
                </div>
                <div className="font-medium">
                  ${(project.budget / 1000).toFixed(0)}k
                  {project.spent && (
                    <span className={cn(
                      'text-sm ml-1',
                      budgetPercent > 100 ? 'text-red-600' : 'text-gray-700'
                    )}>
                      ({budgetPercent.toFixed(0)}% used)
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {project.teamSize && (
              <div className="space-y-1">
                <div className="flex items-center text-gray-700 text-sm">
                  <Users className="h-3 w-3 mr-1" />
                  Team
                </div>
                <div className="font-medium">{project.teamSize} members</div>
              </div>
            )}
            
            {project.endDate && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center text-gray-700 text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  Target Completion
                </div>
                <div className="font-medium">
                  {project.endDate.toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}