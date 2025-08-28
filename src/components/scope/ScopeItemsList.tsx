/**
 * Formula PM V3 Scope Items List
 * List view for scope items with editing capabilities
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { usePermissionsEnhanced } from '@/hooks/usePermissionsEnhanced'
import { SCOPE_CATEGORIES, SCOPE_STATUSES, SCOPE_PERMISSIONS } from '@/types/scope'
import type { ScopeItem } from '@/types/scope'
import { formatDate, formatCurrency, constructionStyles } from '@/types'
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  User,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react'

interface ScopeItemsListProps {
  items: ScopeItem[]
  isLoading: boolean
  onItemUpdated: () => void
  projectId: string
}

export function ScopeItemsList({ 
  items, 
  isLoading, 
  onItemUpdated, 
  projectId 
}: ScopeItemsListProps) {
  const { hasPermission, hasAnyPermission } = usePermissionsEnhanced()
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const statusInfo = SCOPE_STATUSES[status as keyof typeof SCOPE_STATUSES]
    switch (statusInfo?.color) {
      case 'green': return 'bg-green-100 text-green-800'
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'yellow': return 'bg-yellow-100 text-yellow-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      case 'emerald': return 'bg-emerald-100 text-emerald-800'
      case 'red': return 'bg-red-100 text-red-800'
      case 'amber': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryInfo = SCOPE_CATEGORIES[category as keyof typeof SCOPE_CATEGORIES]
    switch (categoryInfo?.color) {
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'amber': return 'bg-amber-100 text-amber-800'
      case 'yellow': return 'bg-yellow-100 text-yellow-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'cyan': return 'bg-cyan-100 text-cyan-800'
      case 'indigo': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="construction-card">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="flex space-x-2">
                  <div className="h-6 bg-muted rounded w-16" />
                  <div className="h-6 bg-muted rounded w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scope items found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first scope item or importing from Excel
            </p>
            {hasAnyPermission(SCOPE_PERMISSIONS.CREATE) && (
              <Button>Add Scope Item</Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="construction-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Title and Status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {hasAnyPermission(SCOPE_PERMISSIONS.EDIT) && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Badges and Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  {item.category && (
                    <Badge variant="outline" className={getCategoryColor(item.category)}>
                      {SCOPE_CATEGORIES[item.category as keyof typeof SCOPE_CATEGORIES]?.label || item.category}
                    </Badge>
                  )}
                  {item.status && (
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {SCOPE_STATUSES[item.status as keyof typeof SCOPE_STATUSES]?.label || item.status}
                    </Badge>
                  )}
                  {item.priority && (
                    <Badge variant="outline">
                      Priority: {item.priority}
                    </Badge>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {/* Quantity & Unit */}
                  {(item.quantity || item.unit) && (
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  )}

                  {/* Cost */}
                  {item.total_cost && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(item.total_cost)}
                      </span>
                    </div>
                  )}

                  {/* Assigned User */}
                  {item.assigned_user && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {item.assigned_user.first_name?.[0]}{item.assigned_user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground truncate">
                        {item.assigned_user.first_name} {item.assigned_user.last_name}
                      </span>
                    </div>
                  )}

                  {/* Timeline */}
                  {(item.start_date || item.end_date) && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">
                        {item.start_date ? formatDate(item.start_date) : 'TBD'}
                        {item.end_date && ` - ${formatDate(item.end_date)}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress removed - not tracked for scope items */}

                {/* Notes */}
                {item.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {item.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More / Pagination placeholder */}
      {items.length >= 20 && (
        <div className="text-center pt-4">
          <Button variant="outline">Load More Items</Button>
        </div>
      )}
    </div>
  )
}