/**
 * Project Shop Drawings Parallel Route - Default Component
 * Shows shop drawings and their approval status
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function DrawingsDefault() {
  const drawings = [
    {
      id: 1,
      name: "Structural Steel Details - Phase 1",
      submittedBy: "Steel Works Inc",
      submittedDate: "2024-01-20",
      status: "approved",
      reviewer: "John Smith",
      comments: 2
    },
    {
      id: 2,
      name: "HVAC Ductwork Layout - Level 1",
      submittedBy: "Climate Solutions",
      submittedDate: "2024-01-22", 
      status: "internal_review",
      reviewer: "Mike Johnson",
      comments: 1
    },
    {
      id: 3,
      name: "Electrical Panel Schedule",
      submittedBy: "Power Systems LLC",
      submittedDate: "2024-01-25",
      status: "client_review",
      reviewer: "Sarah Davis",
      comments: 0
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      internal_review: "bg-blue-100 text-blue-800",
      client_review: "bg-purple-100 text-purple-800", 
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors]
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Shop Drawings</h3>
          <p className="text-sm text-muted-foreground">Drawing submissions and approval workflow</p>
        </div>
        <Button>Upload Drawing</Button>
      </div>
      
      <div className="grid gap-4">
        {drawings.map((drawing) => (
          <Card key={drawing.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-base">{drawing.name}</CardTitle>
                  <CardDescription>
                    Submitted by {drawing.submittedBy} on {drawing.submittedDate}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(drawing.status)}>
                  {drawing.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Reviewer: {drawing.reviewer}
                  </span>
                  <span className="text-muted-foreground">
                    Comments: {drawing.comments}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}