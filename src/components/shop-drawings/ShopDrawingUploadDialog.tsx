/**
 * Formula PM V3 Shop Drawing Upload Dialog
 * Dialog for uploading new shop drawings
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
import { Upload } from 'lucide-react'

interface ShopDrawingUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onDrawingCreated: () => void
}

export function ShopDrawingUploadDialog({
  open,
  onOpenChange,
  projectId,
  onDrawingCreated
}: ShopDrawingUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Shop Drawing</DialogTitle>
        </DialogHeader>
        
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Shop Drawing Upload
          </h3>
          <p className="text-gray-500 mb-4">
            Upload functionality will be implemented in the next phase
          </p>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}