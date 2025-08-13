'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Upload,
  FileText,
  Activity,
  Users,
  Calendar,
  DollarSign,
  ClipboardList,
  CheckSquare,
  Package
} from 'lucide-react'

interface ProjectData {
  id: string
  name: string
  client: string
  status: string
  budget: number
  spent?: number
  start_date: string
  end_date: string
  progress_percentage: number
  description?: string
}

interface ProjectOverviewProps {
  project: ProjectData
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  // Mock metrics based on project
  const projectMetrics = {
    scopeItems: {
      total: 45,
      completed: Math.floor(45 * project.progress_percentage / 100),
      inProgress: Math.floor(45 * (project.progress_percentage / 100) * 0.3),
      pending: 45 - Math.floor(45 * project.progress_percentage / 100) - Math.floor(45 * (project.progress_percentage / 100) * 0.3)
    },
    drawings: {
      total: 23,
      approved: 15,
      pending: 8
    },
    tasks: {
      total: 67,
      completed: 34,
      active: 18,
      overdue: 3
    },
    materials: {
      total: 89,
      approved: 56,
      pending: 33
    }
  }

  // Recent activity for this project
  const recentActivity = [
    {
      user: 'Mehmet Yılmaz',
      action: 'completed task',
      item: 'Install electrical panels - Level 2',
      time: '2 hours ago',
      type: 'task'
    },
    {
      user: 'Elif Özkan',
      action: 'approved shop drawing',
      item: 'HVAC_Layout_B2_Rev_C.pdf',
      time: '4 hours ago',
      type: 'drawing'
    },
    {
      user: 'Ahmet Kocabaş',
      action: 'added scope item',
      item: 'Fire safety system installation',
      time: '1 day ago',
      type: 'scope'
    },
    {
      user: 'Zeynep Demir',
      action: 'approved material spec',
      item: 'LED Light Fixtures - Philips CoreLine',
      time: '2 days ago',
      type: 'material'
    }
  ]

  const formatCurrency = (amount: number) => {
    return `₺${(amount / 1000000).toFixed(2)}M`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'drawing': return <FileText className="h-4 w-4 text-blue-600" />
      case 'scope': return <Plus className="h-4 w-4 text-purple-600" />
      case 'material': return <Package className="h-4 w-4 text-orange-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  // Critical tasks for this project
  const criticalTasks = [
    {
      title: 'Electrical Panel Review',
      description: 'Approve electrical panel shop drawings for Level 2',
      daysOverdue: 3,
      priority: 'critical',
      assignee: 'Mehmet Yılmaz'
    },
    {
      title: 'HVAC System Approval', 
      description: 'Final approval needed for HVAC material specifications',
      daysOverdue: 1,
      priority: 'high',
      assignee: 'Elif Özkan'
    },
    {
      title: 'Fire Suppression Drawing',
      description: 'Review and approve fire suppression system layout',
      daysOverdue: 5,
      priority: 'critical',
      assignee: 'Ahmet Kocabaş'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Critical Tasks Alert Section */}
      {criticalTasks.length > 0 && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-red-900">Critical Tasks Require Attention</CardTitle>
                <p className="text-sm text-red-700 mt-1">{criticalTasks.length} tasks are overdue and need immediate action</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalTasks.map((task, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-red-100 hover:border-red-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <Badge 
                        variant={task.priority === 'critical' ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-red-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{task.daysOverdue}d overdue</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Review Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Key Metrics Cards - Larger with Better Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Scope Items */}
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">Scope Items</CardTitle>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl font-bold text-blue-600 mb-4">{projectMetrics.scopeItems.total}</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Completed</span>
                <span className="font-bold text-green-600 text-lg">{projectMetrics.scopeItems.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600 font-medium">In Progress</span>
                <span className="font-bold text-yellow-600 text-lg">{projectMetrics.scopeItems.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Pending</span>
                <span className="font-bold text-gray-500 text-lg">{projectMetrics.scopeItems.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Drawings */}
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">Shop Drawings</CardTitle>
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl font-bold text-green-600 mb-4">{projectMetrics.drawings.total}</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Approved</span>
                <span className="font-bold text-green-600 text-lg">{projectMetrics.drawings.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-medium">Pending Review</span>
                <span className="font-bold text-orange-600 text-lg">{projectMetrics.drawings.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">Tasks</CardTitle>
              <div className="p-3 bg-purple-100 rounded-xl">
                <CheckSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl font-bold text-purple-600 mb-4">{projectMetrics.tasks.total}</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Completed</span>
                <span className="font-bold text-green-600 text-lg">{projectMetrics.tasks.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">Active</span>
                <span className="font-bold text-blue-600 text-lg">{projectMetrics.tasks.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600 font-medium">Overdue</span>
                <span className="font-bold text-red-600 text-lg">{projectMetrics.tasks.overdue}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials */}
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">Materials</CardTitle>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-4xl font-bold text-orange-600 mb-4">{projectMetrics.materials.total}</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Approved</span>
                <span className="font-bold text-green-600 text-lg">{projectMetrics.materials.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-medium">Pending Review</span>
                <span className="font-bold text-orange-600 text-lg">{projectMetrics.materials.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - Left Column (2/3) - Streamlined Design */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow h-full">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  Recent Activity
                </CardTitle>
                <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  {recentActivity.length} updates
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                  <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm leading-relaxed">
                        <span className="font-semibold text-gray-900">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>
                      </p>
                      <div className="flex items-center gap-2 ml-4">
                        {getActivityIcon(activity.type)}
                        <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 font-medium bg-gray-50 px-3 py-2 rounded-lg border">
                      {activity.item}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* View All Activity Button */}
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions - Right Column (1/3) */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow h-full">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-gray-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enhanced Action Buttons with Better Touch Targets */}
              <Button 
                className="w-full justify-start gap-4 p-6 h-auto bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-900 border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                variant="outline"
              >
                <div className="p-3 bg-blue-200 rounded-xl group-hover:bg-blue-300 transition-colors">
                  <Plus className="h-5 w-5 text-blue-700" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base">Add Scope Item</div>
                  <div className="text-sm text-blue-700 opacity-80">Create new scope item</div>
                </div>
              </Button>

              <Button 
                className="w-full justify-start gap-4 p-6 h-auto bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-900 border-2 border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                variant="outline"
              >
                <div className="p-3 bg-green-200 rounded-xl group-hover:bg-green-300 transition-colors">
                  <Upload className="h-5 w-5 text-green-700" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base">Upload Drawing</div>
                  <div className="text-sm text-green-700 opacity-80">Submit shop drawing</div>
                </div>
              </Button>

              <Button 
                className="w-full justify-start gap-4 p-6 h-auto bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-900 border-2 border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                variant="outline"
              >
                <div className="p-3 bg-purple-200 rounded-xl group-hover:bg-purple-300 transition-colors">
                  <CheckSquare className="h-5 w-5 text-purple-700" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base">Create Task</div>
                  <div className="text-sm text-purple-700 opacity-80">Add new project task</div>
                </div>
              </Button>

              <Button 
                className="w-full justify-start gap-4 p-6 h-auto bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-900 border-2 border-orange-200 hover:border-orange-300 shadow-sm hover:shadow-md transition-all duration-200 group"
                variant="outline"
              >
                <div className="p-3 bg-orange-200 rounded-xl group-hover:bg-orange-300 transition-colors">
                  <Package className="h-5 w-5 text-orange-700" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base">Add Material</div>
                  <div className="text-sm text-orange-700 opacity-80">Submit material spec</div>
                </div>
              </Button>

              {/* Project Context Actions */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-3">Project Tools</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto hover:bg-gray-50 border-gray-200"
                  >
                    <Calendar className="h-5 w-5 text-gray-600 mb-1" />
                    <span className="text-xs">Timeline</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto hover:bg-gray-50 border-gray-200"
                  >
                    <Users className="h-5 w-5 text-gray-600 mb-1" />
                    <span className="text-xs">Team</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}