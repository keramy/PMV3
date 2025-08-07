/**
 * Construction Analytics Charts
 * Interactive Recharts components optimized for construction data visualization
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'
import type { ProjectProgress } from '@/hooks/useDashboardData'

// Chart color palette optimized for construction industry
const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  gray: '#6b7280'
}

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger]

// Project progress overview chart
export function ProjectProgressChart({ 
  projects, 
  isLoading 
}: { 
  projects?: ProjectProgress[]
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!projects?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Project Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No project data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = projects.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    fullName: project.name,
    completion: project.completion_percentage,
    budget: project.budget_utilization,
    schedule: Math.max(0, 100 - project.days_behind_schedule * 2), // Convert days to percentage
    status: project.critical_path_status
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-sm text-blue-600">
            Completion: {data.completion}%
          </p>
          <p className="text-sm text-green-600">
            Budget: {data.budget}%
          </p>
          <p className="text-sm text-orange-600">
            Schedule: {data.schedule}%
          </p>
          <Badge variant={
            data.status === 'on_track' ? 'default' :
            data.status === 'at_risk' ? 'secondary' : 'destructive'
          } className="mt-1">
            {data.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Project Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="completion" 
              fill={CHART_COLORS.primary} 
              name="Completion %" 
              radius={[2, 2, 0, 0]}
            />
            <Line 
              type="monotone" 
              dataKey="budget" 
              stroke={CHART_COLORS.success} 
              strokeWidth={3}
              name="Budget Utilization %"
              dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="schedule" 
              stroke={CHART_COLORS.warning} 
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Schedule Performance %"
              dot={{ fill: CHART_COLORS.warning, strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Budget vs actual spending chart
export function BudgetAnalysisChart({ 
  budgetData, 
  isLoading 
}: { 
  budgetData?: Array<{
    month: string
    planned: number
    actual: number
    projected: number
  }>
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  const defaultData = [
    { month: 'Jan', planned: 800000, actual: 750000, projected: 800000 },
    { month: 'Feb', planned: 900000, actual: 920000, projected: 950000 },
    { month: 'Mar', planned: 1000000, actual: 980000, projected: 1020000 },
    { month: 'Apr', planned: 1100000, actual: 1150000, projected: 1200000 },
    { month: 'May', planned: 1200000, actual: 1180000, projected: 1250000 },
    { month: 'Jun', planned: 1300000, actual: 0, projected: 1350000 },
  ]

  const data = budgetData || defaultData

  const formatCurrency = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="planned" 
              stackId="1"
              stroke={CHART_COLORS.primary} 
              fill="url(#colorPlanned)"
              name="Planned Budget"
            />
            <Area 
              type="monotone" 
              dataKey="actual" 
              stackId="2"
              stroke={CHART_COLORS.success} 
              fill="url(#colorActual)"
              name="Actual Spend"
            />
            <Line 
              type="monotone" 
              dataKey="projected" 
              stroke={CHART_COLORS.warning}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Projected"
              dot={{ fill: CHART_COLORS.warning }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Task completion pie chart
export function TaskStatusChart({ 
  taskStats, 
  isLoading 
}: { 
  taskStats?: Array<{
    name: string
    value: number
    color: string
  }>
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    )
  }

  const defaultData = [
    { name: 'Completed', value: 45, color: CHART_COLORS.success },
    { name: 'In Progress', value: 32, color: CHART_COLORS.primary },
    { name: 'Pending', value: 18, color: CHART_COLORS.warning },
    { name: 'Overdue', value: 5, color: CHART_COLORS.danger },
  ]

  const data = taskStats || defaultData

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Task Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={<CustomLabel />}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} tasks`, 'Count']} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Timeline performance radial chart
export function TimelinePerformanceChart({ 
  performanceData,
  isLoading 
}: { 
  performanceData?: {
    onTime: number
    atRisk: number
    delayed: number
  }
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    )
  }

  const defaultData = {
    onTime: 75,
    atRisk: 20,
    delayed: 5
  }

  const data = performanceData || defaultData
  
  const chartData = [
    { name: 'On Time', value: data.onTime, fill: CHART_COLORS.success },
    { name: 'At Risk', value: data.atRisk, fill: CHART_COLORS.warning },
    { name: 'Delayed', value: data.delayed, fill: CHART_COLORS.danger },
  ]

  const total = data.onTime + data.atRisk + data.delayed
  const healthScore = Math.round((data.onTime / Math.max(total, 1)) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-primary">{healthScore}%</div>
          <div className="text-sm text-muted-foreground">Schedule Health Score</div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={chartData}>
            <RadialBar 
              dataKey="value" 
              cornerRadius={4} 
              fill={(entry: any) => entry.fill}
            />
            <Tooltip formatter={(value: number) => [`${value}%`, 'Projects']} />
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Status breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs mt-4">
          <div className="space-y-1">
            <div className="w-3 h-3 bg-green-500 rounded mx-auto" />
            <div>On Time</div>
            <div className="font-semibold">{data.onTime}%</div>
          </div>
          <div className="space-y-1">
            <div className="w-3 h-3 bg-yellow-500 rounded mx-auto" />
            <div>At Risk</div>
            <div className="font-semibold">{data.atRisk}%</div>
          </div>
          <div className="space-y-1">
            <div className="w-3 h-3 bg-red-500 rounded mx-auto" />
            <div>Delayed</div>
            <div className="font-semibold">{data.delayed}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Weekly progress trend chart
export function WeeklyProgressChart({ 
  weeklyData,
  isLoading 
}: { 
  weeklyData?: Array<{
    week: string
    tasksCompleted: number
    hoursLogged: number
    milestonesReached: number
  }>
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  const defaultData = [
    { week: 'Week 1', tasksCompleted: 23, hoursLogged: 184, milestonesReached: 2 },
    { week: 'Week 2', tasksCompleted: 28, hoursLogged: 192, milestonesReached: 1 },
    { week: 'Week 3', tasksCompleted: 31, hoursLogged: 201, milestonesReached: 3 },
    { week: 'Week 4', tasksCompleted: 26, hoursLogged: 178, milestonesReached: 2 },
  ]

  const data = weeklyData || defaultData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Weekly Progress Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="tasksCompleted" 
              fill={CHART_COLORS.primary} 
              name="Tasks Completed"
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="hoursLogged" 
              stroke={CHART_COLORS.success} 
              strokeWidth={3}
              name="Hours Logged"
              dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="milestonesReached" 
              stroke={CHART_COLORS.warning} 
              strokeWidth={3}
              name="Milestones"
              dot={{ fill: CHART_COLORS.warning, strokeWidth: 2, r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}