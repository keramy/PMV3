'use client'

import { ShopDrawingsTable } from '../../../components/shop-drawings-table'

interface ProjectDrawingsProps {
  projectId: string
}

export function ProjectDrawings({ projectId }: ProjectDrawingsProps) {
  return (
    <div className="space-y-4">
      {/* Project-specific header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Shop Drawings</h2>
          <p className="text-sm text-gray-700">
            Shop drawings and approval workflow for this project
          </p>
        </div>
      </div>

      {/* Reuse the existing shop drawings table component */}
      {/* Note: In real implementation, this would filter by projectId */}
      <ShopDrawingsTable />
    </div>
  )
}