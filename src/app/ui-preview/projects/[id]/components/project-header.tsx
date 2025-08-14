'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Building2, Calendar, TrendingUp, Users } from 'lucide-react'

interface ProjectData {
  id: string
  name: string
  client: string
  status: string
  budget: number
  spent?: number
  start_date: string
  end_date: string
  progress_percentage: number
  description?: string
}

interface ProjectHeaderProps {
  project: ProjectData
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const getStatusBadge = (status: string) => {
    const config = {
      in_progress: { 
        label: 'In Progress', 
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      completed: { 
        label: 'Completed', 
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      planning: { 
        label: 'Planning', 
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      on_hold: { 
        label: 'On Hold', 
        className: 'bg-gray-200 text-gray-900 border-gray-400'
      }
    }
    
    const cfg = config[status as keyof typeof config] || config.in_progress
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return `₺${(amount / 1000000).toFixed(2)}M`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const calculateDaysRemaining = () => {
    const endDate = new Date(project.end_date)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    return `${diffDays} days remaining`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-400 shadow-md p-6">
      {/* Project Title and Status */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-lg text-gray-800">{project.client}</p>
            </div>
          </div>
          {project.description && (
            <p className="text-gray-800 mt-2">{project.description}</p>
          )}
        </div>
        <div className="flex flex-col items-start lg:items-end gap-2">
          {getStatusBadge(project.status)}
          <span className="text-sm text-gray-700">ID: {project.id}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress */}
        <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800">Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={project.progress_percentage} className="flex-1 h-2" />
              <span className="text-sm font-medium">{project.progress_percentage}%</span>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
          <div className="p-2 bg-orange-100 rounded-lg">
            <span className="text-orange-600 font-bold text-sm">₺</span>
          </div>
          <div>
            <p className="text-sm text-gray-800">Budget</p>
            <p className="text-sm font-medium">{formatCurrency(project.budget)}</p>
            {project.spent && (
              <p className="text-xs text-gray-700">
                Spent: {formatCurrency(project.spent)}
              </p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-800">Duration</p>
            <p className="text-sm font-medium">
              {formatDate(project.start_date)} - {formatDate(project.end_date)}
            </p>
            <p className="text-xs text-gray-700">{calculateDaysRemaining()}</p>
          </div>
        </div>

        {/* Team */}
        <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-800">Team</p>
            <p className="text-sm font-medium">8 members</p>
            <p className="text-xs text-gray-700">4 active today</p>
          </div>
        </div>
      </div>
    </div>
  )
}