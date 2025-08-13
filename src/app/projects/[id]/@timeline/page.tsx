/**
 * Timeline Overview Parallel Route
 * Shows project timeline and milestones in project workspace
 */

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TimelineSkeleton } from '@/components/ui/loading-states'
import { Calendar, CheckCircle2, Circle, Clock, Milestone, TrendingUp } from 'lucide-react'

interface TimelinePhase {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'completed' | 'current' | 'upcoming' | 'delayed'
  progress: number
  milestones: TimelineMilestone[]
}

interface TimelineMilestone {
  id: string
  name: string
  dueDate: string
  status: 'completed' | 'current' | 'upcoming' | 'overdue'
  isCompleted: boolean
}

// Mock timeline data - will be replaced with API call
const mockPhases: TimelinePhase[] = [
  {
    id: 'P001',
    name: 'Site Preparation',
    startDate: '2025-01-01',
    endDate: '2025-01-15',
    status: 'completed',
    progress: 100,
    milestones: [
      {
        id: 'M001',
        name: 'Site Survey Complete',
        dueDate: '2025-01-05',
        status: 'completed',
        isCompleted: true
      },
      {
        id: 'M002',
        name: 'Excavation Complete',
        dueDate: '2025-01-12',
        status: 'completed',
        isCompleted: true
      }
    ]
  },
  {
    id: 'P002',
    name: 'Foundation Work',
    startDate: '2025-01-16',
    endDate: '2025-02-28',
    status: 'current',
    progress: 65,
    milestones: [
      {
        id: 'M003',
        name: 'Foundation Pour Complete',
        dueDate: '2025-01-25',
        status: 'completed',
        isCompleted: true
      },
      {
        id: 'M004',
        name: 'Foundation Curing Complete',
        dueDate: '2025-02-10',
        status: 'current',
        isCompleted: false
      },
      {
        id: 'M005',
        name: 'Foundation Inspection Passed',
        dueDate: '2025-02-25',
        status: 'upcoming',
        isCompleted: false
      }
    ]
  },
  {
    id: 'P003',
    name: 'Structural Frame',
    startDate: '2025-03-01',
    endDate: '2025-04-30',
    status: 'upcoming',
    progress: 0,
    milestones: [
      {
        id: 'M006',
        name: 'Steel Delivery',
        dueDate: '2025-03-05',
        status: 'upcoming',
        isCompleted: false
      },
      {
        id: 'M007',
        name: 'Frame Assembly Complete',
        dueDate: '2025-04-15',
        status: 'upcoming',
        isCompleted: false
      }
    ]
  }
]

function TimelineOverviewContent() {
  const currentPhase = mockPhases.find(phase => phase.status === 'current')
  const completedPhases = mockPhases.filter(phase => phase.status === 'completed').length
  const totalPhases = mockPhases.length
  const overallProgress = Math.round((completedPhases / totalPhases) * 100 + (currentPhase?.progress || 0) / totalPhases)

  const getPhaseStatusColor = (status: TimelinePhase['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'current': return 'bg-blue-100 text-blue-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMilestoneStatusIcon = (status: TimelineMilestone['status'], isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle2 className="h-4 w-4 text-green-600" />
    
    switch (status) {
      case 'current': return <Clock className="h-4 w-4 text-blue-600" />
      case 'overdue': return <Circle className="h-4 w-4 text-red-600" />
      default: return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return '1 day left'
    return `${diffDays} days left`
  }

  return (
    <Card className="construction-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Project Timeline</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {overallProgress}% complete
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="font-semibold">{overallProgress}%</span>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Current Phase Status */}
        {currentPhase && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-900">Current Phase</h4>
              <Badge className="bg-blue-100 text-blue-800">
                {currentPhase.progress}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">{currentPhase.name}</span>
              <span className="text-xs text-blue-600">
                {getTimeRemaining(currentPhase.endDate)}
              </span>
            </div>
            <Progress value={currentPhase.progress} className="h-1.5 mt-2" />
          </div>
        )}

        {/* Timeline Phases */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Project Phases</h4>
          {mockPhases.map((phase, index) => (
            <div key={phase.id} className="relative">
              {/* Timeline connector */}
              {index < mockPhases.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200" />
              )}
              
              <div className="flex items-start space-x-3">
                {/* Phase status indicator */}
                <div className={`mt-1 p-1 rounded-full ${
                  phase.status === 'completed' ? 'bg-green-100' :
                  phase.status === 'current' ? 'bg-blue-100' :
                  phase.status === 'delayed' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {phase.status === 'completed' ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : phase.status === 'current' ? (
                    <Clock className="h-3 w-3 text-blue-600" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-400" />
                  )}
                </div>

                {/* Phase details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-sm font-medium text-gray-900">
                      {phase.name}
                    </h5>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPhaseStatusColor(phase.status)}`}
                    >
                      {phase.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>
                      {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                    </span>
                    <span>{phase.progress}% complete</span>
                  </div>

                  {phase.progress > 0 && phase.progress < 100 && (
                    <Progress value={phase.progress} className="h-1 mb-2" />
                  )}

                  {/* Recent milestones */}
                  {phase.milestones.length > 0 && (
                    <div className="space-y-1">
                      {phase.milestones.slice(0, 2).map((milestone) => (
                        <div key={milestone.id} className="flex items-center space-x-2">
                          {getMilestoneStatusIcon(milestone.status, milestone.isCompleted)}
                          <span className={`text-xs ${
                            milestone.isCompleted ? 'text-green-600' :
                            milestone.status === 'current' ? 'text-blue-600' :
                            milestone.status === 'overdue' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {milestone.name} ({formatDate(milestone.dueDate)})
                          </span>
                        </div>
                      ))}
                      
                      {phase.milestones.length > 2 && (
                        <div className="text-xs text-gray-400 pl-6">
                          +{phase.milestones.length - 2} more milestones
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Milestones Summary */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Milestone className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Next Milestone</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Foundation Curing Complete
              </div>
              <div className="text-xs text-gray-500">
                Due Feb 10 (12 days)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TimelineOverviewPage() {
  return (
    <Suspense fallback={<TimelineSkeleton />}>
      <TimelineOverviewContent />
    </Suspense>
  )
}