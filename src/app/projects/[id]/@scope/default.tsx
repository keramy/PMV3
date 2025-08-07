/**
 * Project Scope Parallel Route - Default Component
 * Shows scope items and progress for the project
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ScopeDefault() {
  const scopeItems = [
    {
      id: 1,
      item: "Foundation & Footings",
      progress: 100,
      status: "completed",
      assignee: "ABC Construction",
      dueDate: "2024-01-15"
    },
    {
      id: 2,
      item: "Structural Steel Erection", 
      progress: 75,
      status: "in_progress",
      assignee: "Steel Works Inc",
      dueDate: "2024-02-28"
    },
    {
      id: 3,
      item: "HVAC Installation",
      progress: 0,
      status: "not_started",
      assignee: "Climate Solutions",
      dueDate: "2024-03-15"
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      not_started: "bg-gray-100 text-gray-800"
    }
    return colors[status as keyof typeof colors]
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Scope Items</h3>
          <p className="text-sm text-muted-foreground">Project work breakdown and assignments</p>
        </div>
        <Button>Add Scope Item</Button>
      </div>
      
      <div className="grid gap-4">
        {scopeItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{item.item}</CardTitle>
                  <CardDescription>Due: {item.dueDate} • Assigned to: {item.assignee}</CardDescription>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}