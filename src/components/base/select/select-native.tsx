'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  label: string
  value: string
  badge?: number
}

interface NativeSelectProps {
  'aria-label': string
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options: SelectOption[]
  className?: string
  disabled?: boolean
}

export function NativeSelect({ 
  'aria-label': ariaLabel, 
  value, 
  onChange, 
  options, 
  className,
  disabled = false
}: NativeSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm',
        'bg-white text-sm text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed',
        className
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
          {option.badge && option.badge > 0 ? ` (${option.badge})` : ''}
        </option>
      ))}
    </select>
  )
}