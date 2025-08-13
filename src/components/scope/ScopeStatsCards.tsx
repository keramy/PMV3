/**
 * Formula PM V3 Scope Statistics Cards
 * Display scope statistics in construction-optimized cards
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { SCOPE_CATEGORIES } from '@/types/scope'
import type { ScopeStatistics } from '@/types/scope'
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  Package
} from 'lucide-react'

interface ScopeStatsCardsProps {
  statistics: ScopeStatistics
}

export function ScopeStatsCards({ statistics }: ScopeStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-gray-500'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Items Card */}
      <Card className="construction-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.total_items}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <Package className="h-3 w-3" />
            <span>Scope items in project</span>
          </div>
        </CardContent>
      </Card>

      {/* Completion Progress Card */}
      <Card className="construction-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(statistics.by_category).map(([category, stats]) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.label || category}
                  </span>
                  <span className={`font-medium ${getCompletionColor(stats.completion_percentage)}`}>
                    {stats.completion_percentage}%
                  </span>
                </div>
                <Progress value={stats.completion_percentage} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown Card */}
      <Card className="construction-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {statistics.by_status.completed || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-muted-foreground">In Progress</span>
              </div>
              <span className="text-sm font-medium text-blue-600">
                {statistics.by_status.in_progress || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                <span className="text-sm text-muted-foreground">Planning</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">
                {statistics.by_status.planning || 0}
              </span>
            </div>
            
            {(statistics.by_status.blocked || 0) > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">Blocked</span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {statistics.by_status.blocked}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Card */}
      <Card className="construction-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.financial.total_budget)}
              </div>
              <p className="text-xs text-muted-foreground">Total budget</p>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg. item cost:</span>
              <span className="font-medium">
                {formatCurrency(statistics.financial.average_item_cost)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Highest cost:</span>
              <span className="font-medium">
                {formatCurrency(statistics.financial.highest_cost_item)}
              </span>
            </div>
            
            {statistics.financial.items_without_cost > 0 && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 rounded">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  {statistics.financial.items_without_cost} items missing cost data
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Status Card */}
      <Card className="construction-card md:col-span-2 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Timeline & Categories</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Timeline Status */}
            <div>
              <h4 className="text-sm font-medium mb-3">Timeline Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">On Schedule</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {statistics.timeline.on_schedule}
                  </span>
                </div>
                
                {statistics.timeline.overdue > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">Overdue</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {statistics.timeline.overdue}
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-muted-foreground">Not Scheduled</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {statistics.timeline.not_scheduled}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-3">Category Overview</h4>
              <div className="space-y-2">
                {Object.entries(statistics.by_category)
                  .filter(([_, stats]) => stats.total > 0)
                  .map(([category, stats]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <div 
                            className={`h-2 w-2 rounded-full`}
                            style={{ 
                              backgroundColor: SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.color === 'blue' ? '#3b82f6' :
                                              SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.color === 'amber' ? '#f59e0b' :
                                              SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.color === 'yellow' ? '#eab308' :
                                              SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.color === 'green' ? '#10b981' :
                                              SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.color === 'cyan' ? '#06b6d4' :
                                              SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.color === 'indigo' ? '#6366f1' : '#6b7280'
                            }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]?.label || category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {stats.total} items
                        </span>
                        <span className={`text-sm font-medium ${getCompletionColor(stats.completion_percentage)}`}>
                          {stats.completion_percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}