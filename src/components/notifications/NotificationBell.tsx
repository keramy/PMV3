'use client'

/**
 * Notification Bell Component
 * Bell icon with unread count badge that shows notification dropdown
 */

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { useEnableNotificationRealtime } from '@/hooks/useNotificationRealtime'
import { NotificationDropdown } from './NotificationDropdown'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { data: unreadCount, isLoading } = useUnreadNotificationCount()
  
  // Enable real-time notification updates
  useEnableNotificationRealtime()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className={cn(
          'relative h-9 w-9 rounded-full',
          'hover:bg-gray-100 focus:bg-gray-100',
          'transition-colors duration-200',
          isOpen && 'bg-gray-100'
        )}
        aria-label={`Notifications ${unreadCount ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        
        {/* Unread Badge */}
        {!isLoading && unreadCount && unreadCount > 0 && (
          <Badge 
            className={cn(
              'absolute -top-1 -right-1 h-5 w-5 rounded-full p-0',
              'flex items-center justify-center text-xs font-medium',
              'bg-red-500 text-white border-2 border-white',
              'shadow-sm'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gray-300 animate-pulse" />
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-80 max-w-[90vw]', // Responsive width for mobile
            'bg-white rounded-lg border shadow-lg',
            'animate-in slide-in-from-top-2 duration-200'
          )}
        >
          <NotificationDropdown 
            onClose={() => setIsOpen(false)}
            onViewAll={() => {
              setIsOpen(false)
              // Navigation will be handled by the dropdown component
            }}
          />
        </div>
      )}
    </div>
  )
}