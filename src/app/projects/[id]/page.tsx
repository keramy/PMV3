/**
 * Project Overview Page
 * Main project dashboard and summary view
 */

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="space-y-8">
      {/* Project Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="construction-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Project Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="construction-badge bg-primary-100 text-primary-800">
                Active
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Progress:</span>
              <span className="font-semibold">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>

        <div className="construction-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Key Metrics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Scope Items:</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">11</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-semibold text-yellow-600">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Not Started:</span>
              <span className="font-semibold text-gray-500">5</span>
            </div>
          </div>
        </div>

        <div className="construction-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Timeline
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-semibold">Jan 15, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Target End:</span>
              <span className="font-semibold">Aug 30, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days Left:</span>
              <span className="font-semibold text-primary-600">205</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="construction-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Shop drawing approved for Foundation Steel
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  New task assigned: Install electrical panels
                </p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Material specification pending review
                </p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="construction-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors mobile-touch-target">
              <div className="text-2xl mb-2">📐</div>
              <div className="text-sm font-medium text-primary-900">Upload Drawing</div>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors mobile-touch-target">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium text-green-900">Create Task</div>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors mobile-touch-target">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium text-orange-900">Add Scope Item</div>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors mobile-touch-target">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-purple-900">View Reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}