/**
 * Formula PM V3 Shop Drawing Detail Dialog
 * Dialog for viewing and managing shop drawing details with approval workflow
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  SHOP_DRAWING_STATUSES, 
  DRAWING_CATEGORIES,
  type ShopDrawing 
} from '@/types/shop-drawings'
import {
  FileImage,
  Calendar,
  User,
  MessageSquare,
  Download,
  Eye
} from 'lucide-react'

interface ShopDrawingDetailDialogProps {
  drawing: ShopDrawing
  open: boolean
  onOpenChange: (open: boolean) => void
  onDrawingUpdated: () => void
}

export function ShopDrawingDetailDialog({
  drawing,
  open,
  onOpenChange,
  onDrawingUpdated
}: ShopDrawingDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const statusConfig = SHOP_DRAWING_STATUSES[drawing.status as keyof typeof SHOP_DRAWING_STATUSES]
  const categoryConfig = DRAWING_CATEGORIES[drawing.category as keyof typeof DRAWING_CATEGORIES]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileImage className="h-5 w-5" />
            <span>{drawing.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {drawing.drawing_number && (
                <p className="text-sm text-muted-foreground">
                  Drawing #{drawing.drawing_number}
                </p>
              )}
              {drawing.description && (
                <p className="text-gray-600">
                  {drawing.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`bg-${statusConfig?.color}-100 text-${statusConfig?.color}-800`}
              >
                {statusConfig?.label}
              </Badge>
            </div>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Drawing Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span>{categoryConfig?.icon}</span>
                  <span>{categoryConfig?.label}</span>
                </div>
              </div>
              
              {drawing.trade && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Trade</label>
                  <p className="mt-1">{drawing.trade}</p>
                </div>
              )}

              {drawing.priority && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <p className="mt-1 capitalize">{drawing.priority}</p>
                </div>
              )}

              {drawing.due_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(drawing.due_date)}</span>
                  </div>
                </div>
              )}

              {drawing.submitted_by_user && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted By</label>
                  <div className="flex items-center space-x-1 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>
                      {drawing.submitted_by_user.first_name} {drawing.submitted_by_user.last_name}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Submitted Date</label>
                <div className="flex items-center space-x-1 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(drawing.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Approval Workflow
                </h3>
                <p className="text-gray-500 mb-4">
                  Detailed approval workflow will be implemented in the next phase
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Drawing
              </Button>
            </div>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}