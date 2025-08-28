'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Constants } from '@/types/database.generated'
import { AlertCircle, Circle } from 'lucide-react'

interface PrioritySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const priorityConfig = {
  low: {
    label: 'Low',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Circle
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Circle
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertCircle
  },
  critical: {
    label: 'Critical',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle
  }
}

export function PrioritySelect({ value, onValueChange, placeholder = "Select priority", disabled, className }: PrioritySelectProps) {
  const priorities = Constants.public.Enums.material_priority

  const renderPriorityOption = (priority: string) => {
    const config = priorityConfig[priority as keyof typeof priorityConfig]
    if (!config) return priority

    const Icon = config.icon
    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className="capitalize">{config.label}</span>
      </div>
    )
  }

  const renderSelectedValue = (value: string) => {
    const config = priorityConfig[value as keyof typeof priorityConfig]
    if (!config) return value

    return (
      <Badge 
        variant="outline" 
        className={`${config.bgColor} ${config.color} ${config.borderColor} capitalize`}
      >
        {config.label}
      </Badge>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value ? renderSelectedValue(value) : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {priorities.map((priority) => (
          <SelectItem key={priority} value={priority}>
            {renderPriorityOption(priority)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority as keyof typeof priorityConfig]
  if (!config) return <Badge variant="outline">{priority}</Badge>

  const Icon = config.icon
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.bgColor} ${config.color} ${config.borderColor} capitalize flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}