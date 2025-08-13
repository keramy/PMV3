'use client'

/**
 * Notification Dropdown Component
 * Shows recent notifications in a dropdown with quick actions
 */

import { useRouter } from 'next/navigation'
import { MoreHorizontal, X, CheckCheck, Eye, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-states'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  useRecentNotifications, 
  useMarkAllAsRead, 
  useMarkSpecificAsRead 
} from '@/hooks/useNotifications'
import { 
  getNotificationIcon, 
  getNotificationColor, 
  formatNotificationTime 
} from '@/types/notifications'
import type { Notification } from '@/types/notifications'

interface NotificationDropdownProps {
  onClose: () => void
  onViewAll: () => void
}

export function NotificationDropdown({ onClose, onViewAll }: NotificationDropdownProps) {
  const router = useRouter()
  const { data: notificationData, isLoading, error } = useRecentNotifications()
  const markAllAsRead = useMarkAllAsRead()
  const markSpecificAsRead = useMarkSpecificAsRead()

  const notifications = notificationData?.notifications || []
  const unreadCount = notificationData?.unread_count || 0

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

    onClose()
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleViewAll = () => {
    router.push('/notifications')
    onViewAll()
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Failed to load notifications</p>
        <Button variant="ghost" size="sm" onClick={onClose} className="mt-2">
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
          
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-gray-500">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              You'll see updates about tasks and mentions here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Individual notification item component
interface NotificationItemProps {
  notification: Notification
  onClick: () => void
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const isUnread = !notification.read_at
  const icon = getNotificationIcon(notification.type)
  const colorClasses = getNotificationColor(notification.type)
  const timeFormatted = formatNotificationTime(notification.created_at)

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 cursor-pointer transition-colors duration-150',
        'hover:bg-gray-50',
        isUnread && 'bg-blue-50 border-l-4 border-l-blue-500'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm',
          colorClasses
        )}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn(
                'text-sm font-medium text-gray-900 line-clamp-1',
                isUnread && 'font-semibold'
              )}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {notification.message}
              </p>
            </div>
            
            {/* Time and unread indicator */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-500">{timeFormatted}</p>
              {isUnread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}