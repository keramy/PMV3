/**
 * Formula PM V3 - Centralized Formatting Utilities
 * Consolidates all date, currency, and text formatting functions
 * Eliminates duplicate formatting code across components
 */

import { format, formatDistanceToNow as fnsFormatDistanceToNow, isValid, parseISO, isToday, isYesterday } from 'date-fns'
import { DATE_FORMATS } from './constants'

// ============================================================================
// DATE FORMATTING UTILITIES
// ============================================================================

/**
 * Safely parse a date string or Date object
 */
function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  
  try {
    if (typeof date === 'string') {
      // Handle ISO date strings
      const parsed = parseISO(date)
      if (isValid(parsed)) return parsed
      
      // Fallback to regular Date parsing
      const fallback = new Date(date)
      if (isValid(fallback)) return fallback
    }
    
    if (date instanceof Date && isValid(date)) {
      return date
    }
  } catch (error) {
    console.warn('Failed to parse date:', date, error)
  }
  
  return null
}

/**
 * Format date for display (MMM d, yyyy)
 * Replaces 4+ duplicate implementations across components
 */
export function formatDate(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'
  
  try {
    return format(parsed, DATE_FORMATS.DISPLAY_DATE)
  } catch (error) {
    console.warn('Failed to format date:', date, error)
    return 'Invalid Date'
  }
}

/**
 * Format date and time for display (MMM d, yyyy h:mm a)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'
  
  try {
    return format(parsed, DATE_FORMATS.DISPLAY_DATETIME)
  } catch (error) {
    console.warn('Failed to format datetime:', date, error)
    return 'Invalid Date'
  }
}

/**
 * Format date for input fields (yyyy-MM-dd)
 */
export function formatInputDate(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return ''
  
  try {
    return format(parsed, DATE_FORMATS.INPUT_DATE)
  } catch (error) {
    console.warn('Failed to format input date:', date, error)
    return ''
  }
}

/**
 * Format time only (h:mm a)
 */
export function formatTime(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'
  
  try {
    return format(parsed, DATE_FORMATS.TIME_ONLY)
  } catch (error) {
    console.warn('Failed to format time:', date, error)
    return 'Invalid Time'
  }
}

/**
 * Format relative time distance (e.g., "2 hours ago", "in 3 days")
 * Replaces duplicate formatDistanceToNow implementations
 */
export function formatDistanceToNow(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'
  
  try {
    return fnsFormatDistanceToNow(parsed, { addSuffix: true })
  } catch (error) {
    console.warn('Failed to format distance to now:', date, error)
    return 'Unknown'
  }
}

/**
 * Check if a date is overdue (past due and not completed)
 */
export function isOverdue(dueDate: string | Date | null | undefined, status?: string): boolean {
  const parsed = parseDate(dueDate)
  if (!parsed) return false
  
  const now = new Date()
  const isCompleted = status === 'completed' || status === 'approved'
  
  return parsed < now && !isCompleted
}

/**
 * Smart timestamp formatting for activity feeds
 * Shows relative time for recent dates, absolute for older ones
 */
export function formatSmartTimestamp(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return 'N/A'
  
  try {
    if (isToday(parsed)) {
      return fnsFormatDistanceToNow(parsed, { addSuffix: true })
    } else if (isYesterday(parsed)) {
      return `Yesterday at ${format(parsed, DATE_FORMATS.TIME_ONLY)}`
    } else {
      return format(parsed, 'MMM d, h:mm a')
    }
  } catch (error) {
    console.warn('Failed to format smart timestamp:', date, error)
    return formatDistanceToNow(date)
  }
}

/**
 * Get a smart date group label for activity feeds
 * Returns "Today", "Yesterday", or formatted date
 */
export function getDateGroupLabel(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return 'Unknown'
  
  try {
    if (isToday(parsed)) {
      return 'Today'
    } else if (isYesterday(parsed)) {
      return 'Yesterday'
    } else {
      return format(parsed, 'MMMM d, yyyy')
    }
  } catch (error) {
    console.warn('Failed to format date group label:', date, error)
    return formatDate(date)
  }
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): number {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  
  if (!start || !end) return 0
  
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

// ============================================================================
// CURRENCY FORMATTING UTILITIES
// ============================================================================

/**
 * Format currency with proper locale formatting
 * Replaces multiple inline currency formatting
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options: {
    currency?: string
    locale?: string
    showCents?: boolean
  } = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showCents = true
  } = options
  
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return '$0.00'
  }
  
  // Parse string numbers
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  // Handle invalid numbers
  if (isNaN(numericAmount)) {
    return '$0.00'
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0
    }).format(numericAmount)
  } catch (error) {
    console.warn('Failed to format currency:', amount, error)
    return `$${numericAmount.toFixed(showCents ? 2 : 0)}`
  }
}

/**
 * Format percentage with proper formatting
 */
export function formatPercentage(
  value: number | string | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined || value === '') {
    return '0%'
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numericValue)) {
    return '0%'
  }
  
  return `${numericValue.toFixed(decimals)}%`
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === '') {
    return '0'
  }
  
  const numericValue = typeof num === 'string' ? parseFloat(num) : num
  
  if (isNaN(numericValue)) {
    return '0'
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(numericValue)
  } catch (error) {
    console.warn('Failed to format compact number:', num, error)
    
    // Fallback manual formatting
    if (numericValue >= 1000000000) {
      return `${(numericValue / 1000000000).toFixed(1)}B`
    }
    if (numericValue >= 1000000) {
      return `${(numericValue / 1000000).toFixed(1)}M`
    }
    if (numericValue >= 1000) {
      return `${(numericValue / 1000).toFixed(1)}K`
    }
    return numericValue.toString()
  }
}

// ============================================================================
// TEXT FORMATTING UTILITIES
// ============================================================================

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string | null | undefined): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 50,
  suffix: string = '...'
): string {
  if (!text) return ''
  
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Format user's full name
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  if (!firstName && !lastName) return 'Unknown User'
  if (!firstName) return lastName || 'Unknown User'
  if (!lastName) return firstName
  
  return `${firstName} ${lastName}`.trim()
}

/**
 * Format user's initials
 */
export function formatInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  
  if (first && last) return `${first}${last}`
  if (first) return first
  if (last) return last
  
  return '??'
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if a date string is valid
 */
export function isValidDate(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  
  const parsed = parseDate(dateString)
  return parsed !== null
}

/**
 * Check if an email is valid (basic validation)
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if a phone number is valid (basic US format)
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  
  const phoneRegex = /^[\+]?[1]?[\s\-]?[\(]?[0-9]{3}[\)]?[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}