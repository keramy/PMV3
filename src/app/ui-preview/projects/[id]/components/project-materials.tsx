'use client'

import { MaterialSpecsTable } from '../../../components/material-specs-table'

interface ProjectMaterialsProps {
  projectId: string
}

export function ProjectMaterials({ projectId }: ProjectMaterialsProps) {
  return (
    <div className="space-y-4">
      {/* Project-specific header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Material Specifications</h2>
          <p className="text-sm text-gray-700">
            Material specs and PM approval workflow for this project
          </p>
        </div>
      </div>

      {/* Reuse the existing material specs table component */}
      {/* Note: In real implementation, this would filter by projectId */}
      <MaterialSpecsTable />
    </div>
  )
}