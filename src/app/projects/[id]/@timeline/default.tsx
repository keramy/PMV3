/**
 * Project Timeline Parallel Route - Default Component
 * Shows project Gantt chart and milestones
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function TimelineDefault() {
  const milestones = [
    {
      id: 1,
      name: "Foundation Complete",
      date: "2024-01-15",
      status: "completed",
      progress: 100
    },
    {
      id: 2,
      name: "Structural Steel Erected",
      date: "2024-02-28",
      status: "in_progress", 
      progress: 75
    },
    {
      id: 3,
      name: "Mechanical Rough-in",
      date: "2024-03-30",
      status: "upcoming",
      progress: 0
    },
    {
      id: 4,
      name: "Final Inspection",
      date: "2024-05-15",
      status: "upcoming",
      progress: 0
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
      upcoming: "bg-gray-100 text-gray-800",
      delayed: "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors]
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Timeline</h3>
          <p className="text-sm text-muted-foreground">Milestones and schedule overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Gantt Chart</Button>
          <Button>Add Milestone</Button>
        </div>
      </div>

      {/* Timeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Project Schedule</CardTitle>
          <CardDescription>Key milestones and progress tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    milestone.status === 'completed' 
                      ? 'bg-green-500 border-green-500' 
                      : milestone.status === 'in_progress'
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`} />
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                  )}
                </div>
                
                {/* Milestone content */}
                <div className="flex-1 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-medium">{milestone.name}</h4>
                    <p className="text-sm text-muted-foreground">Target: {milestone.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {milestone.progress}% Complete
                    </div>
                    <Badge className={getStatusColor(milestone.status)}>
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Gantt Chart</CardTitle>
          <CardDescription>Visual timeline of all project tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center text-muted-foreground">
            Interactive Gantt Chart Component (Coming Soon)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}