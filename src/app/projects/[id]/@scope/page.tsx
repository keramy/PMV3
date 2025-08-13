/**
 * Scope Overview Parallel Route
 * Shows scope items summary in project workspace
 */

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScopeItemsSkeleton } from '@/components/ui/loading-states'
import { Layers, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface ScopeItem {
  id: string
  name: string
  trade: string
  status: 'completed' | 'in-progress' | 'pending' | 'blocked'
  assignee?: string
  dueDate?: string
  progress: number
}

// Mock scope items - will be replaced with API call
const mockScopeItems: ScopeItem[] = [
  {
    id: 'S001',
    name: 'Foundation Excavation',
    trade: 'Site Work',
    status: 'completed',
    assignee: 'ABC Excavation',
    progress: 100
  },
  {
    id: 'S002', 
    name: 'Foundation Concrete',
    trade: 'Concrete',
    status: 'in-progress',
    assignee: 'Metro Concrete',
    dueDate: '2025-01-15',
    progress: 65
  },
  {
    id: 'S003',
    name: 'Structural Steel Frame',
    trade: 'Steel',
    status: 'pending',
    assignee: 'Steel Works LLC',
    dueDate: '2025-02-01',
    progress: 0
  },
  {
    id: 'S004',
    name: 'Electrical Rough-In',
    trade: 'Electrical', 
    status: 'blocked',
    assignee: 'Power Electric',
    dueDate: '2025-01-20',
    progress: 15
  }
]

function ScopeOverviewContent() {
  const totalItems = mockScopeItems.length
  const completed = mockScopeItems.filter(item => item.status === 'completed').length
  const inProgress = mockScopeItems.filter(item => item.status === 'in-progress').length
  const blocked = mockScopeItems.filter(item => item.status === 'blocked').length
  const overallProgress = Math.round(mockScopeItems.reduce((acc, item) => acc + item.progress, 0) / totalItems)

  const getStatusIcon = (status: ScopeItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Layers className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: ScopeItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800' 
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="construction-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>Scope Summary</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalItems} items
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completed:</span>
            <span className="font-semibold text-green-600">{completed}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">In Progress:</span>
            <span className="font-semibold text-blue-600">{inProgress}</span>
          </div>
        </div>

        {blocked > 0 && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 font-medium">
                {blocked} item{blocked !== 1 ? 's' : ''} blocked
              </span>
            </div>
          </div>
        )}

        {/* Recent Scope Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Items</h4>
          {mockScopeItems.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(item.status)}`}
                    >
                      {item.status.replace('-', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">{item.trade}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">{item.progress}%</div>
                {item.assignee && (
                  <div className="text-xs text-gray-500 truncate max-w-20">
                    {item.assignee}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ScopeOverviewPage() {
  return (
    <Suspense fallback={<ScopeItemsSkeleton count={3} />}>
      <ScopeOverviewContent />
    </Suspense>
  )
}