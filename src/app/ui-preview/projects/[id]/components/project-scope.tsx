'use client'

import { ScopeTable } from '../../../components/scope-table'

interface ProjectScopeProps {
  projectId: string
}

export function ProjectScope({ projectId }: ProjectScopeProps) {
  return (
    <div className="space-y-4">
      {/* Project-specific header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Project Scope Items</h2>
          <p className="text-sm text-gray-700">
            Scope items and assignments for this project
          </p>
        </div>
      </div>

      {/* Reuse the existing scope table component */}
      {/* Note: In real implementation, this would filter by projectId */}
      <ScopeTable />
    </div>
  )
}