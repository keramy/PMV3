/**
 * Dashboard Recent Activity Parallel Route - Default Component
 * Shows recent project activities and updates
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function RecentDefault() {
  const recentActivities = [
    {
      id: 1,
      project: "Downtown Office Complex",
      activity: "Shop drawing approved",
      user: "John Smith",
      time: "2 minutes ago",
      type: "approval"
    },
    {
      id: 2,
      project: "Warehouse Renovation",
      activity: "Task completed: Install HVAC",
      user: "Mike Johnson",
      time: "15 minutes ago",
      type: "task"
    },
    {
      id: 3,
      project: "Retail Center",
      activity: "Change order submitted",
      user: "Sarah Davis",
      time: "1 hour ago",
      type: "change_order"
    }
  ]

  const getActivityBadge = (type: string) => {
    const variants = {
      approval: "bg-green-100 text-green-800",
      task: "bg-blue-100 text-blue-800", 
      change_order: "bg-orange-100 text-orange-800"
    }
    return variants[type as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{activity.project}</p>
                <p className="text-sm text-muted-foreground">{activity.activity}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getActivityBadge(activity.type)}>
                    {activity.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}