/**
 * Formula PM V3 Shop Drawings List
 * List view for shop drawings with approval workflow actions
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  SHOP_DRAWING_STATUSES, 
  DRAWING_CATEGORIES, 
  DRAWING_PRIORITIES,
  SHOP_DRAWING_PERMISSIONS,
  type ShopDrawing 
} from '@/types/shop-drawings'
import {
  MoreHorizontal,
  Eye,
  Download,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Upload,
  Calendar,
  User,
  FileImage,
  Paperclip
} from 'lucide-react'

interface ShopDrawingsListProps {
  drawings: ShopDrawing[]
  isLoading: boolean
  onDrawingClick: (drawing: ShopDrawing) => void
  onDrawingUpdated: () => void
  projectId: string
}

export function ShopDrawingsList({ 
  drawings, 
  isLoading, 
  onDrawingClick, 
  onDrawingUpdated, 
  projectId 
}: ShopDrawingsListProps) {
  const { hasPermission, hasAnyPermission } = usePermissions()
  const [selectedDrawings, setSelectedDrawings] = useState<string[]>([])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysUntilDue = (dueDateString?: string) => {
    if (!dueDateString) return null
    
    const dueDate = new Date(dueDateString)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true }
    if (diffDays === 0) return { text: 'Due today', isOverdue: false, isToday: true }
    if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false }
    return { text: `${diffDays}d left`, isOverdue: false }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U'
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'internal_review':
      case 'client_review':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'revision_required':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <FileImage className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    const config = DRAWING_PRIORITIES[priority as keyof typeof DRAWING_PRIORITIES]
    return config ? `border-l-${config.color}-500` : ''
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (drawings.length === 0) {
    return (
      <Card className="construction-card">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <FileImage className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No shop drawings found</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first shop drawing to get started with the approval workflow
            </p>
            {hasAnyPermission(SHOP_DRAWING_PERMISSIONS.CREATE) && (
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Drawing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {drawings.map((drawing) => {
        const statusConfig = SHOP_DRAWING_STATUSES[drawing.status as keyof typeof SHOP_DRAWING_STATUSES]
        const categoryConfig = DRAWING_CATEGORIES[drawing.category as keyof typeof DRAWING_CATEGORIES]
        const dueInfo = getDaysUntilDue(drawing.due_date)
        const priorityColor = getPriorityColor(drawing.priority || 'medium')

        return (
          <Card 
            key={drawing.id} 
            className={`construction-card hover:shadow-md transition-shadow cursor-pointer border-l-4 ${priorityColor}`}
            onClick={() => onDrawingClick(drawing)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Status Icon */}
                <div className="flex-shrink-0 pt-1">
                  {getStatusIcon(drawing.status)}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 truncate">
                        {drawing.title}
                      </h3>
                      {drawing.drawing_number && (
                        <p className="text-sm text-gray-500">
                          Drawing #{drawing.drawing_number}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge 
                        variant="outline" 
                        className={`text-xs bg-${statusConfig?.color}-100 text-${statusConfig?.color}-800`}
                      >
                        {statusConfig?.label}
                      </Badge>
                      {drawing.priority && drawing.priority !== 'medium' && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs bg-${DRAWING_PRIORITIES[drawing.priority as keyof typeof DRAWING_PRIORITIES]?.color}-100`}
                        >
                          {DRAWING_PRIORITIES[drawing.priority as keyof typeof DRAWING_PRIORITIES]?.label}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {drawing.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {drawing.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex items-center space-x-2 mb-3">
                    {drawing.category && (
                      <Badge variant="outline" className="text-xs">
                        <span className="mr-1">{categoryConfig?.icon}</span>
                        {categoryConfig?.label}
                      </Badge>
                    )}
                    {drawing.trade && (
                      <Badge variant="outline" className="text-xs">
                        {drawing.trade}
                      </Badge>
                    )}
                    {drawing.current_revision && (
                      <Badge variant="outline" className="text-xs">
                        Rev {drawing.current_revision}
                      </Badge>
                    )}
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      {/* Submitted By */}
                      {drawing.submitted_by_user && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>
                            {drawing.submitted_by_user.first_name} {drawing.submitted_by_user.last_name}
                          </span>
                        </div>
                      )}

                      {/* Submitted Date */}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Submitted {formatDate(drawing.created_at)}</span>
                      </div>

                      {/* Comments Count */}
                      {drawing.comments && drawing.comments.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{drawing.comments.length} comment{drawing.comments.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {/* Revisions Count */}
                      {drawing.total_revisions && drawing.total_revisions > 1 && (
                        <div className="flex items-center space-x-1">
                          <Upload className="h-3 w-3" />
                          <span>{drawing.total_revisions} revision{drawing.total_revisions !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    {dueInfo && (
                      <div className={`flex items-center space-x-1 ${
                        dueInfo.isOverdue ? 'text-red-600' : dueInfo.isToday ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        <AlertTriangle 
                          className={`h-3 w-3 ${
                            dueInfo.isOverdue ? 'text-red-600' : dueInfo.isToday ? 'text-orange-600' : 'text-gray-400'
                          }`} 
                        />
                        <span>{dueInfo.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Approval Progress */}
                  {(drawing.status === 'submitted_to_client' || drawing.status === 'revision_requested' || drawing.status === 'approved') && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Approval Progress</span>
                        <span className="text-xs text-gray-600">
                          {drawing.status === 'approved' ? '100%' : 
                           drawing.status === 'submitted_to_client' ? '50%' : 
                           drawing.status === 'revision_requested' ? '75%' : '25%'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={
                            drawing.status === 'approved' ? 100 : 
                            drawing.status === 'revision_requested' ? 75 : 
                            drawing.status === 'submitted_to_client' ? 50 : 25
                          } 
                          className="flex-1 h-2" 
                        />
                        <div className="flex items-center space-x-1">
                          {drawing.submitted_to_client_by_user && (
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {getInitials(drawing.submitted_to_client_by_user.first_name ?? undefined, drawing.submitted_to_client_by_user.last_name ?? undefined)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {drawing.client_contact_user && (
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {getInitials(drawing.client_contact_user.first_name ?? undefined, drawing.client_contact_user.last_name ?? undefined)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    {hasAnyPermission(SHOP_DRAWING_PERMISSIONS.VIEW) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDrawingClick(drawing)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    {hasAnyPermission(SHOP_DRAWING_PERMISSIONS.DOWNLOAD) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Download functionality
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: More actions menu
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}