'use client'

/**
 * Formula PM V3 - User Permission Management Dashboard
 * Admin interface for managing user roles, permissions, and project assignments
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePermissions } from '@/hooks/usePermissions'
import { toast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Settings, 
  Shield, 
  Eye, 
  EyeOff, 
  Crown,
  Wrench,
  UserCheck,
  User,
  Building,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import type { UserRole, EnhancedUserProfile } from '@/types/roles'
import { DEFAULT_ROLES, getRoleDisplayName, getRoleDescription } from '@/lib/permissions/roles'

interface UserWithPermissions extends EnhancedUserProfile {
  project_count?: number
  last_activity?: string
}

interface Project {
  id: string
  name: string
  status: string
}

export function UserPermissionManager() {
  const { isAdmin, loading } = usePermissions()
  const queryClient = useQueryClient()
  
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')

  // Fetch all users with their permission data (always call hooks first)
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserWithPermissions[]> => {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      return await response.json()
    },
    enabled: !loading && isAdmin, // Only fetch when user is authenticated and admin
  })

  // Fetch all projects for client assignment
  const { data: projects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async (): Promise<Project[]> => {
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')
      return await response.json()
    },
    enabled: !loading && isAdmin, // Only fetch when user is authenticated and admin
  })

  // Mutation to update user permissions
  const updateUserPermissions = useMutation({
    mutationFn: async (updates: {
      userId: string
      role?: UserRole
      can_view_costs?: boolean | null
      assigned_projects?: string[]
    }) => {
      const response = await fetch(`/api/admin/users/${updates.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error('Failed to update permissions')
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: 'Permissions Updated',
        description: 'User permissions have been successfully updated.',
      })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setEditModalOpen(false)
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Don't render if not admin (after hooks are called)
  if (loading) return <div>Loading permissions...</div>
  if (!isAdmin) return <div>Access denied. Admin privileges required.</div>

  // Filter users based on search and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  }) ?? []

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      admin: <Crown className="h-4 w-4 text-purple-600" />,
      technical_manager: <Wrench className="h-4 w-4 text-blue-600" />,
      project_manager: <UserCheck className="h-4 w-4 text-green-600" />,
      team_member: <User className="h-4 w-4 text-gray-600" />,
      client: <Building className="h-4 w-4 text-orange-600" />,
    }
    return icons[role] || <User className="h-4 w-4" />
  }

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-300',
      technical_manager: 'bg-blue-100 text-blue-800 border-blue-300',
      project_manager: 'bg-green-100 text-green-800 border-green-300',
      team_member: 'bg-gray-100 text-gray-800 border-gray-300',
      client: 'bg-orange-100 text-orange-800 border-orange-300',
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            User Permission Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user roles, cost visibility, and project assignments
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="technical_manager">Technical Managers</SelectItem>
                  <SelectItem value="project_manager">Project Managers</SelectItem>
                  <SelectItem value="team_member">Team Members</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Cost Access</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = DEFAULT_ROLES[user.role as UserRole]
                  const hasCustomCostAccess = user.can_view_costs !== null
                  const canViewCosts = user.can_view_costs ?? roleConfig?.default_can_view_costs ?? false
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.first_name?.[0] ?? user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name || 'No Name'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role as UserRole)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(user.role as UserRole)}
                            {getRoleDisplayName(user.role as UserRole)}
                          </div>
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canViewCosts ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={canViewCosts ? 'text-green-700' : 'text-gray-500'}>
                            {canViewCosts ? 'Can View' : 'Hidden'}
                          </span>
                          {hasCustomCostAccess && (
                            <Badge variant="outline" className="text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {user.role === 'client' ? (
                          <span className="text-sm">
                            {user.assigned_projects?.length ?? 0} assigned
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {user.project_count ?? 0} accessible
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'Never'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setEditModalOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <EditUserDialog
        user={selectedUser}
        projects={projects ?? []}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={(updates) => updateUserPermissions.mutate(updates)}
        loading={updateUserPermissions.isPending}
      />
    </div>
  )
}

// Edit User Dialog Component
interface EditUserDialogProps {
  user: UserWithPermissions | null
  projects: Project[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: any) => void
  loading: boolean
}

function EditUserDialog({ user, projects, open, onOpenChange, onSave, loading }: EditUserDialogProps) {
  const [role, setRole] = useState<UserRole>('team_member')
  const [costOverride, setCostOverride] = useState<boolean | null>(null)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [useCustomCosts, setUseCustomCosts] = useState(false)

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setRole(user.role as UserRole || 'team_member')
      setCostOverride(user.can_view_costs ?? null)
      setSelectedProjects(user.assigned_projects || [])
      setUseCustomCosts(user.can_view_costs !== null)
    }
  }, [user])

  if (!user) return null

  const roleConfig = DEFAULT_ROLES[role]
  const effectiveCostAccess = costOverride !== null ? costOverride : roleConfig.default_can_view_costs

  const handleSave = () => {
    onSave({
      userId: user.id,
      role,
      can_view_costs: useCustomCosts ? costOverride : null,
      assigned_projects: role === 'client' ? selectedProjects : [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Edit User Permissions
          </DialogTitle>
          <DialogDescription>
            Update {user.full_name || user.email}'s role and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Selection */}
          <div>
            <Label className="text-sm font-medium">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DEFAULT_ROLES).map((roleOption) => (
                  <SelectItem key={roleOption.role_name} value={roleOption.role_name}>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(roleOption.role_name)}
                      <div>
                        <div className="font-medium">{roleOption.display_name}</div>
                        <div className="text-xs text-gray-500">{roleOption.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost Visibility Override */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Cost Visibility</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="custom-costs" className="text-xs">Custom Override</Label>
                <Switch
                  id="custom-costs"
                  checked={useCustomCosts}
                  onCheckedChange={setUseCustomCosts}
                />
              </div>
            </div>
            
            {useCustomCosts ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="costAccess"
                      checked={costOverride === true}
                      onChange={() => setCostOverride(true)}
                    />
                    <Eye className="h-4 w-4 text-green-600" />
                    Can View Costs
                  </Label>
                  <Label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="costAccess"
                      checked={costOverride === false}
                      onChange={() => setCostOverride(false)}
                    />
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    Cannot View Costs
                  </Label>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {effectiveCostAccess ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                Using role default: {effectiveCostAccess ? 'Can view costs' : 'Cannot view costs'}
              </div>
            )}
          </div>

          {/* Client Project Assignment */}
          {role === 'client' && (
            <div>
              <Label className="text-sm font-medium">Assigned Projects</Label>
              <p className="text-xs text-gray-500 mb-2">
                Clients can only access specifically assigned projects
              </p>
              <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                {projects.length === 0 ? (
                  <p className="text-sm text-gray-500">No projects available</p>
                ) : (
                  projects.map((project) => (
                    <Label key={project.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjects([...selectedProjects, project.id])
                          } else {
                            setSelectedProjects(selectedProjects.filter(id => id !== project.id))
                          }
                        }}
                      />
                      <span>{project.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {project.status}
                      </Badge>
                    </Label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getRoleIcon(role: UserRole) {
  const icons = {
    admin: <Crown className="h-4 w-4 text-purple-600" />,
    technical_manager: <Wrench className="h-4 w-4 text-blue-600" />,
    project_manager: <UserCheck className="h-4 w-4 text-green-600" />,
    team_member: <User className="h-4 w-4 text-gray-600" />,
    client: <Building className="h-4 w-4 text-orange-600" />,
  }
  return icons[role] || <User className="h-4 w-4" />
}