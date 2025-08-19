/**
 * Formula PM V3 Project Creation Dialog
 * Dialog for creating new construction projects
 */

'use client'

import { useState } from 'react'
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
import { Loader2, Building2, Calendar, DollarSign, User, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

// Form input schema (before transformation)
const projectCreateInputSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Name must be under 200 characters'),
  client_name: z.string().min(1, 'Client name is required').max(100, 'Client name must be under 100 characters'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.string().optional(), // String in form
  status: z.enum(['planning', 'active', 'on_hold', 'completed']).default('planning'),
})

// Transform schema for API submission
const projectCreateSchema = projectCreateInputSchema.transform((data) => ({
  ...data,
  budget: data.budget === '' ? undefined : (data.budget ? parseFloat(data.budget) : undefined)
}))

type ProjectCreateFormData = z.infer<typeof projectCreateInputSchema>

interface ProjectCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: (project: any) => void
}

export function ProjectCreateDialog({ open, onOpenChange, onProjectCreated }: ProjectCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ProjectCreateFormData>({
    resolver: zodResolver(projectCreateInputSchema),
    defaultValues: {
      name: '',
      client_name: '',
      description: '',
      start_date: '',
      end_date: '',
      budget: '',
      status: 'planning',
    },
  })

  const onSubmit = async (data: ProjectCreateFormData) => {
    if (!profile?.id) {
      setError('User authentication required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Transform the data before sending to API
      const transformedData = projectCreateSchema.parse(data)
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': profile.id,
        },
        body: JSON.stringify(transformedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project')
      }

      const result = await response.json()
      
      // Show success toast
      toast({
        title: "Project Created Successfully!",
        description: `${result.project?.name || 'Your project'} has been created and is ready for setup.`,
        variant: "default",
      })
      
      // Reset form
      form.reset()
      
      // Close dialog
      onOpenChange(false)
      
      // Notify parent component
      onProjectCreated?.(result.project)
      
      // Navigate to new project workspace
      if (result.project?.id) {
        router.push(`/projects/${result.project.id}`)
      }

    } catch (error) {
      console.error('Error creating project:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project'
      setError(errorMessage)
      
      // Show error toast
      toast({
        title: "Failed to Create Project",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-6 w-6 text-blue-600" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Set up a new construction project with basic details. You can add scope items, tasks, and team members after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Project Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Akbank Head Office Renovation"
                      {...field}
                      className="border-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Client Name */}
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Akbank"
                      {...field}
                      className="border-gray-400"
                    />
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
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Project Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the project scope and objectives..."
                      className="min-h-[80px] border-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="border-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="border-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Budget (₺)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5000000"
                        {...field}
                        className="border-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-400">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="border-gray-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}