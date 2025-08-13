/**
 * Dedicated Notifications Page
 * Full notification management interface with filtering and pagination
 */

import { Suspense } from 'react'
import { NotificationsList } from '@/components/notifications/NotificationsList'
import { LoadingSpinner } from '@/components/ui/loading-states'

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              Stay updated on task assignments, mentions, and project activity
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-gray-500">Loading notifications...</span>
          </div>
        }>
          <NotificationsList />
        </Suspense>
      </div>
    </div>
  )
}