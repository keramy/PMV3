/**
 * Project Tasks Page
 * Full task management interface for the project
 */

import { Suspense } from 'react'
import { TaskList } from '@/components/tasks/TaskList'
import { LoadingSpinner } from '@/components/ui/loading-states'

interface TasksPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { id: projectId } = await params
  
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Tasks</h1>
          <p className="text-gray-600 mt-2">
            Manage and track all project tasks, assignments, and progress.
          </p>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <TaskList projectId={projectId} />
        </Suspense>
      </div>
    </div>
  )
}