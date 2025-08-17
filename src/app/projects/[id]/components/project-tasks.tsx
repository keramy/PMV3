'use client'

import { TaskList } from '@/components/tasks/TaskList'

interface ProjectTasksProps {
  projectId: string
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  return (
    <div className="space-y-4">
      {/* Project-specific header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Project Tasks</h2>
          <p className="text-sm text-gray-700">
            Task management and tracking for this project
          </p>
        </div>
      </div>

      {/* Reuse the existing tasks list component */}
      {/* Note: In real implementation, this would filter by projectId */}
      <TaskList />
    </div>
  )
}