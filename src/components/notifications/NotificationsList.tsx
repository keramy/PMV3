'use client'

/**
 * Comprehensive Notifications List Component
 * Full-featured notification management with filtering, pagination, and actions
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Filter, 
  CheckCheck, 
  Check,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-states'
import { cn } from '@/lib/utils'
import { 
  useNotifications, 
  useMarkAllAsRead, 
  useMarkSpecificAsRead 
} from '@/hooks/useNotifications'
import { 
  getNotificationIcon, 
  getNotificationColor, 
  formatNotificationTime 
} from '@/types/notifications'
import type { Notification, NotificationFilters } from '@/types/notifications'

export function NotificationsList() {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState<'all' | 'unread' | 'mentions' | 'assignments'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Build filters based on current tab
  const filters: NotificationFilters = {
    page: currentPage,
    limit: 20,
    ...(currentTab === 'unread' && { unread_only: true }),
    ...(currentTab === 'mentions' && { type: ['task_mention'] }),
    ...(currentTab === 'assignments' && { type: ['task_assignment'] })
  }

  const { data: notificationData, isLoading, error } = useNotifications(filters)
  const markAllAsRead = useMarkAllAsRead()
  const markSpecificAsRead = useMarkSpecificAsRead()

  const notifications = notificationData?.notifications || []
  const unreadCount = notificationData?.unread_count || 0
  const pagination = {
    page: notificationData?.page || 1,
    total: notificationData?.total || 0,
    hasNext: notificationData?.has_next || false,
    hasPrevious: notificationData?.has_previous || false
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read if unread
    if (!notification.read_at) {
      markSpecificAsRead([notification.id])
    }

    // Navigate based on notification type
    const data = notification.data
    
    switch (notification.type) {
      case 'task_assignment':
      case 'task_mention':
      case 'task_status_change':
      case 'task_comment':
      case 'task_due_reminder':
        if (data?.task_id && data?.project_id) {
          router.push(`/projects/${data.project_id}/tasks?taskId=${data.task_id}`)
        }
        break
      case 'project_update':
        if (data?.project_id) {
          router.push(`/projects/${data.project_id}`)
        }
        break
    }
  }

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab as typeof currentTab)
    setCurrentPage(1) // Reset to first page when changing tabs
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 mb-4">Failed to load notifications</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Tabs for filtering */}
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All
              {unreadCount > 0 && currentTab === 'all' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
            <TabsTrigger value="assignments">Tasks</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/notifications/preferences')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notifications Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-gray-500">Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentTab === 'unread' ? 'No unread notifications' : 
             currentTab === 'mentions' ? 'No mentions yet' :
             currentTab === 'assignments' ? 'No task assignments' :
             'No notifications yet'}
          </h3>
          <p className="text-gray-500">
            {currentTab === 'all' 
              ? "You'll see updates about tasks, mentions, and project activity here"
              : `Switch to "All" to see your complete notification history`
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Notification List */}
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>

          {/* Pagination */}
          {(pagination.hasNext || pagination.hasPrevious) && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-gray-500">
                Showing {Math.min(pagination.total, ((pagination.page - 1) * 20) + notifications.length)} of {pagination.total} notifications
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-500 px-3">
                  Page {pagination.page}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Individual notification card component
interface NotificationCardProps {
  notification: Notification
  onClick: () => void
}

function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const markSpecificAsRead = useMarkSpecificAsRead()
  
  const isUnread = !notification.read_at
  const icon = getNotificationIcon(notification.type)
  const colorClasses = getNotificationColor(notification.type)
  const timeFormatted = formatNotificationTime(notification.created_at)

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isUnread) {
      markSpecificAsRead([notification.id])
    }
  }

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md border',
        isUnread ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          colorClasses
        )}>
          <span className="text-lg">{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h4 className={cn(
                'text-base font-medium text-gray-900 mb-1',
                isUnread && 'font-semibold'
              )}>
                {notification.title}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {notification.message}
              </p>
              
              {/* Additional context from data */}
              {notification.data?.project_name && (
                <p className="text-xs text-gray-500 mt-2">
                  Project: {notification.data.project_name}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <time className="text-xs text-gray-500">
                {timeFormatted}
              </time>
              
              {isUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              {isUnread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}