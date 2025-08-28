'use client'

import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface CostVarianceBadgeProps {
  initialCost: number | null
  actualCost: number | null
  costVariance?: number | null
  costVariancePercentage?: number | null
  showPercentage?: boolean
  className?: string
}

export function CostVarianceBadge({ 
  initialCost, 
  actualCost, 
  costVariance, 
  costVariancePercentage,
  showPercentage = true,
  className 
}: CostVarianceBadgeProps) {
  // Calculate variance if not provided
  const calculatedVariance = costVariance ?? (
    initialCost && actualCost ? actualCost - initialCost : null
  )
  
  const calculatedPercentage = costVariancePercentage ?? (
    initialCost && calculatedVariance && initialCost > 0 
      ? (calculatedVariance / initialCost) * 100 
      : null
  )

  // If no data available
  if (calculatedVariance === null || calculatedVariance === 0) {
    return (
      <Badge variant="outline" className={`text-gray-600 bg-gray-50 border-gray-200 ${className}`}>
        <Minus className="h-3 w-3 mr-1" />
        On Budget
      </Badge>
    )
  }

  // Determine if over or under budget
  const isOverBudget = calculatedVariance > 0
  const absVariance = Math.abs(calculatedVariance)
  const absPercentage = calculatedPercentage ? Math.abs(calculatedPercentage) : null

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const displayText = showPercentage && absPercentage 
    ? `${absPercentage.toFixed(1)}%`
    : formatCurrency(absVariance)

  if (isOverBudget) {
    return (
      <Badge variant="destructive" className={`text-red-700 bg-red-50 border-red-200 ${className}`}>
        <TrendingUp className="h-3 w-3 mr-1" />
        +{displayText}
      </Badge>
    )
  } else {
    return (
      <Badge variant="outline" className={`text-green-700 bg-green-50 border-green-200 ${className}`}>
        <TrendingDown className="h-3 w-3 mr-1" />
        -{displayText}
      </Badge>
    )
  }
}

export function CostSummaryCard({ 
  totalBudget, 
  totalActual, 
  itemCount 
}: { 
  totalBudget: number
  totalActual: number
  itemCount: number
}) {
  const variance = totalActual - totalBudget
  const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0
  const isOverBudget = variance > 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Cost Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium">{itemCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Budgeted:</span>
          <span className="font-medium">{formatCurrency(totalBudget)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Actual:</span>
          <span className="font-medium">{formatCurrency(totalActual)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-gray-600">Variance:</span>
          <CostVarianceBadge 
            initialCost={totalBudget}
            actualCost={totalActual}
            showPercentage={true}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  )
}