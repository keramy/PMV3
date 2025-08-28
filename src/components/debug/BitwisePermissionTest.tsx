/**
 * Bitwise Permission System Test Component
 * Use this to verify the new permission system is working correctly
 */

'use client'

import React from 'react'
import { useAuthContext } from '@/providers/AuthProvider'
import { PERMISSIONS } from '@/lib/permissions/bitwise'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function BitwisePermissionTest() {
  const {
    user,
    profile,
    permissions,
    hasPermission,
    canViewFinancials,
    canManageProjects,
    canManageUsers,
    isAdmin,
    roleDisplayName,
    permissionNames,
    filterFinancialData
  } = useAuthContext()

  if (!user || !profile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🔐 Bitwise Permission Test</CardTitle>
          <CardDescription>Please log in to test the permission system</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Test data with cost fields
  const testScopeItems = [
    {
      id: '1',
      name: 'Foundation Work',
      unit_cost: 1500,
      total_cost: 15000,
      description: 'Concrete foundation for main building'
    },
    {
      id: '2', 
      name: 'Steel Frame',
      unit_cost: 2500,
      total_cost: 75000,
      description: 'Steel framework structure'
    }
  ]

  const filteredData = filterFinancialData(testScopeItems)

  const testProject = {
    id: '123',
    name: 'Test Project',
    created_by: user.id // This user owns this test project
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔐 Bitwise Permission System Test</CardTitle>
          <CardDescription>Verify your new permission system is working correctly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div>
            <h3 className="font-semibold mb-2">User Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> <Badge variant="outline">{roleDisplayName}</Badge>
              </div>
              <div>
                <span className="font-medium">Raw Permissions Value:</span> {permissions}
              </div>
              <div>
                <span className="font-medium">Binary:</span> {permissions.toString(2).padStart(28, '0')}
              </div>
            </div>
          </div>

          {/* Core Permission Checks */}
          <div>
            <h3 className="font-semibold mb-2">Core Permission Checks</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={canViewFinancials ? "default" : "destructive"}>
                  {canViewFinancials ? "✅" : "❌"}
                </Badge>
                <span>Can View Financials</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={canManageProjects ? "default" : "destructive"}>
                  {canManageProjects ? "✅" : "❌"}
                </Badge>
                <span>Can Manage Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isAdmin ? "default" : "destructive"}>
                  {isAdmin ? "✅" : "❌"}
                </Badge>
                <span>Is Admin</span>
              </div>
            </div>
          </div>

          {/* Specific Permission Tests */}
          <div>
            <h3 className="font-semibold mb-2">Specific Permission Tests</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { name: 'View All Projects', permission: PERMISSIONS.VIEW_ALL_PROJECTS },
                { name: 'Create Projects', permission: PERMISSIONS.CREATE_PROJECTS },
                { name: 'View Financial Data', permission: PERMISSIONS.VIEW_FINANCIAL_DATA },
                { name: 'Manage Scope', permission: PERMISSIONS.MANAGE_SCOPE },
                { name: 'View Shop Drawings', permission: PERMISSIONS.VIEW_SHOP_DRAWINGS },
                { name: 'Create Tasks', permission: PERMISSIONS.CREATE_TASKS },
                { name: 'Export Data', permission: PERMISSIONS.EXPORT_DATA },
                { name: 'Manage All Users', permission: PERMISSIONS.MANAGE_ALL_USERS }
              ].map(({ name, permission }) => (
                <div key={name} className="flex items-center gap-2">
                  <Badge variant={hasPermission(permission) ? "default" : "secondary"}>
                    {hasPermission(permission) ? "✅" : "❌"}
                  </Badge>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Filtering Test */}
          <div>
            <h3 className="font-semibold mb-2">Cost Data Filtering Test</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Original Data (with costs):</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(testScopeItems, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Filtered Data {canViewFinancials ? '(costs visible)' : '(costs hidden)'}:
                </h4>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(filteredData, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Active Permissions List */}
          <div>
            <h3 className="font-semibold mb-2">Active Permissions ({permissionNames.length})</h3>
            <div className="flex flex-wrap gap-1">
              {permissionNames.map(permission => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          {/* Performance Info */}
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-blue-900 mb-1">🚀 Performance Benefits</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Permission checks: O(1) bitwise operations (vs O(n) array searches)</li>
              <li>• Storage: 8 bytes per user (vs ~200 bytes for arrays)</li>
              <li>• Database queries: Simple integer comparisons (vs complex array operations)</li>
              <li>• Future expansion: 36 bits available for new permissions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}