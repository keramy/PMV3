import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects | Formula PM V3',
  description: 'Manage all construction projects',
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">
              Manage your construction projects from start to finish
            </p>
          </div>
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors mobile-touch-target">
            + New Project
          </button>
        </div>

        {/* Projects Grid/List */}
        <div className="construction-card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Projects Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first construction project to get started with Formula PM V3
            </p>
            <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
              Create First Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}