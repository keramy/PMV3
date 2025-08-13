/**
 * Formula PM V3 Scope Item Dialog
 * Dialog for creating and editing scope items
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SCOPE_CATEGORIES, SCOPE_STATUSES } from '@/types/scope'
import type { ScopeItemFormData, ScopeItem } from '@/types/scope'
import { Loader2 } from 'lucide-react'

// Form validation schema
const scopeItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['construction', 'millwork', 'electrical', 'mechanical', 'plumbing', 'hvac']).optional(),
  specification: z.string().optional(),
  quantity: z.coerce.number().min(0, 'Quantity must be positive').optional(),
  unit: z.string().optional(),
  unit_cost: z.coerce.number().min(0, 'Unit cost must be positive').optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  priority: z.string().optional(),
  status: z.enum(['not_started', 'planning', 'materials_ordered', 'in_progress', 'quality_check', 'client_review', 'completed', 'blocked', 'on_hold', 'cancelled']).optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof scopeItemSchema>

interface ScopeItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  projectId: string
  item?: ScopeItem
}

export function ScopeItemDialog({
  isOpen,
  onClose,
  onSaved,
  projectId,
  item
}: ScopeItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!item

  const form = useForm<FormData>({
    resolver: zodResolver(scopeItemSchema),
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
      specification: '',
      quantity: undefined,
      unit: '',
      unit_cost: undefined,
      start_date: '',
      end_date: '',
      priority: '',
      status: 'not_started',
      notes: '',
    }
  })

  // Update form when editing an existing item
  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description || '',
        category: item.category as any,
        specification: item.specification || '',
        quantity: item.quantity || undefined,
        unit: item.unit || '',
        unit_cost: item.unit_cost || undefined,
        start_date: item.start_date || '',
        end_date: item.end_date || '',
        priority: item.priority || '',
        status: item.status as any || 'not_started',
        notes: item.notes || '',
      })
    } else {
      form.reset({
        title: '',
        description: '',
        category: undefined,
        specification: '',
        quantity: undefined,
        unit: '',
        unit_cost: undefined,
        start_date: '',
        end_date: '',
        priority: '',
        status: 'not_started',
        notes: '',
      })
    }
  }, [item, form])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const url = isEditing ? `/api/scope/${item.id}` : '/api/scope'
      const method = isEditing ? 'PUT' : 'POST'

      const payload = isEditing 
        ? data 
        : { ...data, project_id: projectId }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} scope item`)
      }

      onSaved()
      onClose()
      form.reset()
    } catch (error) {
      console.error('Scope item save error:', error)
      // TODO: Add proper error handling/toast
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      form.reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Scope Item' : 'Add New Scope Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the scope item details below.' 
              : 'Create a new scope item for this project.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter scope item title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter detailed description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SCOPE_CATEGORIES).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SCOPE_STATUSES).map(([key, status]) => (
                          <SelectItem key={key} value={key}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.01" placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ea, sf, lf..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Cost */}
              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes or comments" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update' : 'Create'} Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}