/**
 * Formula PM V3 - Admin Users Management Page
 * Admin interface for managing user roles and permissions
 */

import { UserPermissionManager } from '@/components/admin/UserPermissionManager'

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-8">
      <UserPermissionManager />
    </div>
  )
}

export const metadata = {
  title: 'User Management - Formula PM V3',
  description: 'Manage user roles, permissions, and project assignments',
}