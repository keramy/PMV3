/**
 * Dashboard Statistics Parallel Route - Default Component
 * Shows performance charts and statistics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function StatsDefault() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>
            Projects completion timeline overview
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Timeline Chart Placeholder
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>
            Budget utilization across active projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Budget Chart Placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  )
}