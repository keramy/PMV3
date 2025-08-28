/**
 * Formula PM V3 - Custom Loading Component
 * Animated loading spinner with Formula branding
 * Based on design from Uiverse.io by Subaashbala
 */

import React from 'react'
import { cn } from '@/lib/utils'
import styles from './formula-loader.module.css'

interface FormulaLoaderProps {
  className?: string
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FormulaLoader({ 
  className, 
  text = "FORMULA",
  size = 'md' 
}: FormulaLoaderProps) {
  const sizeClass = size === 'sm' ? styles.small : size === 'lg' ? styles.large : styles.medium

  return (
    <div className={cn(styles.loader, sizeClass, className)}>
      <span className={styles.brackets}>&lt;</span>
      <span className={styles.formulaText}>{text}</span>
      <span className={styles.brackets}>/&gt;</span>
    </div>
  )
}

// Centered loading state component
export function FormulaLoading({ 
  text = "Loading...", 
  description,
  size = 'md' 
}: {
  text?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div className={styles.loadingContainer}>
      <FormulaLoader size={size} />
      <div className={styles.loadingText}>
        <p className={styles.loadingTitle}>{text}</p>
        {description && (
          <p className={styles.loadingDescription}>{description}</p>
        )}
      </div>
    </div>
  )
}

// Inline loading component for smaller spaces
export function FormulaLoadingInline({ 
  text = "Loading", 
  size = 'sm',
  className 
}: {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <div className={cn(styles.inlineLoader, className)}>
      <FormulaLoader text="FORMULA" size={size} />
      <span className={styles.inlineText}>{text}...</span>
    </div>
  )
}