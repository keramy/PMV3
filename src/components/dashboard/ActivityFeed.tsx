/**
 * Real-time Construction Activity Feed
 * Optimized for construction workflows with React Query integration
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActivityFeedSkeleton, CompactActivityFeedSkeleton } from '@/components/ui/loading-states'
import { getPriorityBadgeProps } from '@/lib/styling/construction-styles'
import { 
  CheckCircle, 
  FileImage, 
  Flag, 
  DollarSign, 
  AlertCircle, 
  Clock,
  User,
  RefreshCw,
  Filter,
  Zap
} from 'lucide-react'
import { formatDate, formatDistanceToNow, formatSmartTimestamp, getDateGroupLabel } from '@/lib/formatting'
import { useState } from 'react'
import type { ActivityFeedItem } from '@/hooks/useDashboardData'

interface ActivityFeedProps {
  activities?: ActivityFeedItem[]
  isLoading: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
}

// Activity type icons and colors
const ACTIVITY_CONFIG = {
  'task_completed': {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Task Completed'
  },
  'drawing_approved': {
    icon: FileImage,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Drawing Approved'
  },
  'milestone_reached': {
    icon: Flag,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Milestone Reached'
  },
  'change_order': {
    icon: DollarSign,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Change Order'
  },
  'rfi_submitted': {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'RFI Submitted'
  },
}

function ActivityItem({ activity }: { activity: ActivityFeedItem }) {
  const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG['task_completed']
  const Icon = config.icon
  
  const formatTime = (timestamp: string) => {
    return formatSmartTimestamp(timestamp)
  }

  const getPriorityBadge = (priority: string) => {
    if (!priority || !['critical', 'high', 'medium'].includes(priority)) return null
    const props = getPriorityBadgeProps(priority as any, 'text-xs')
    return <Badge {...props} />
  }

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} hover:shadow-sm transition-shadow`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.title}
            </p>
            {getPriorityBadge(activity.priority)}
          </div>
          <span className="text-xs text-gray-700 flex-shrink-0">
            {formatTime(activity.timestamp)}
          </span>
        </div>
        
        {activity.description && (
          <p className="text-sm text-gray-800 mb-2 line-clamp-2">
            {activity.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-700">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{activity.user_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="truncate">{activity.project_name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}


export function ActivityFeed({ activities, isLoading, onRefresh, isRefreshing }: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all')
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeedSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (!activities?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here as work progresses</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    return activity.priority === filter
  })

  const groupActivityByDate = (activities: ActivityFeedItem[]) => {
    const groups: { [key: string]: ActivityFeedItem[] } = {}
    
    activities.forEach(activity => {
      const key = getDateGroupLabel(activity.timestamp)
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(activity)
    })
    
    return groups
  }

  const groupedActivities = groupActivityByDate(filteredActivities)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recent Activity
            {activities.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {activities.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Priority filter */}
            <div className="flex rounded-md border">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1 text-xs rounded-l-md transition-colors ${
                  filter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-2 py-1 text-xs border-x transition-colors ${
                  filter === 'critical' ? 'bg-destructive text-destructive-foreground' : 'hover:bg-muted'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-2 py-1 text-xs rounded-r-md transition-colors ${
                  filter === 'high' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                }`}
              >
                High
              </button>
            </div>
            
            {/* Refresh button */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-6 pt-0 space-y-4">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-900">{date}</h4>
                  <div className="flex-1 h-px bg-gray-400" />
                  <Badge variant="outline" className="text-xs">
                    {dateActivities.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {dateActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-8 w-8 mx-auto mb-2" />
                <p>No activities match the current filter</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-2"
                >
                  Clear filter
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Compact activity feed for smaller spaces
export function CompactActivityFeed({ activities, isLoading }: { activities?: ActivityFeedItem[], isLoading: boolean }) {
  if (isLoading) {
    return <CompactActivityFeedSkeleton />
  }

  const recentActivities = activities?.slice(0, 5) || []

  return (
    <div className="space-y-2">
      {recentActivities.map((activity) => {
        const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG['task_completed']
        const Icon = config.icon
        
        return (
          <div key={activity.id} className="flex gap-2 p-2 rounded border hover:bg-muted/50 transition-colors">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${config.bgColor}`}>
              <Icon className={`h-3 w-3 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{activity.title}</p>
              <p className="text-xs text-gray-700 truncate">
                {activity.user_name} • {formatDistanceToNow(activity.timestamp)}
              </p>
            </div>
          </div>
        )
      })}
      
      {recentActivities.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No recent activity</p>
        </div>
      )}
    </div>
  )
}