'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface LogoProps {
  variant?: 'icon' | 'text' | 'full' | 'auto'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' 
  className?: string
  animate?: boolean
}

const sizeClasses = {
  xs: {
    icon: 'h-4 w-4',
    text: 'h-3',
    gap: 'gap-1'
  },
  sm: {
    icon: 'h-6 w-6', 
    text: 'h-4',
    gap: 'gap-1.5'
  },
  md: {
    icon: 'h-8 w-8',
    text: 'h-6', 
    gap: 'gap-2'
  },
  lg: {
    icon: 'h-12 w-12',
    text: 'h-8',
    gap: 'gap-3'
  },
  xl: {
    icon: 'h-16 w-16',
    text: 'h-12',
    gap: 'gap-4'
  }
}

export function Logo({ 
  variant = 'auto', 
  size = 'md', 
  className = '',
  animate = false 
}: LogoProps) {
  const sizeConfig = sizeClasses[size]
  
  const iconClasses = cn(
    sizeConfig.icon,
    animate && 'animate-pulse',
    className
  )

  const textClasses = cn(
    sizeConfig.text,
    className
  )

  // Icon only variant
  if (variant === 'icon') {
    return (
      <Image
        src="/logos/logo-f.png"
        alt="Formula PM"
        width={64}
        height={64}
        className={iconClasses}
        priority
      />
    )
  }

  // Text only variant  
  if (variant === 'text') {
    return (
      <Image
        src="/logos/logo-formula.png"
        alt="Formula PM"
        width={200}
        height={48}
        className={textClasses}
        priority
      />
    )
  }

  // Full variant (icon + text)
  if (variant === 'full') {
    return (
      <div className={cn('flex items-center', sizeConfig.gap)}>
        <Image
          src="/logos/logo-f.png"
          alt="Formula PM"
          width={64}
          height={64}
          className={iconClasses}
          priority
        />
        <Image
          src="/logos/logo-formula.png"
          alt="Formula PM"
          width={200}
          height={48}
          className={textClasses}
          priority
        />
      </div>
    )
  }

  // Auto variant (responsive: icon on mobile, full on desktop)
  return (
    <div className={cn('flex items-center', sizeConfig.gap)}>
      {/* Mobile: Icon only */}
      <Image
        src="/logos/logo-f.png"
        alt="Formula PM"
        width={64}
        height={64}
        className={cn(iconClasses, 'lg:hidden')}
        priority
      />
      
      {/* Desktop: Icon + Text */}
      <div className={cn('hidden lg:flex items-center', sizeConfig.gap)}>
        <Image
          src="/logos/logo-f.png"
          alt="Formula PM"
          width={64}
          height={64}
          className={iconClasses}
          priority
        />
        <Image
          src="/logos/logo-formula.png"
          alt="Formula PM"
          width={200}
          height={48}
          className={textClasses}
          priority
        />
      </div>
    </div>
  )
}

// Specialized variants for common use cases
export function LogoIcon({ size = 'md', className, animate }: Omit<LogoProps, 'variant'>) {
  return <Logo variant="icon" size={size} className={className} animate={animate} />
}

export function LogoText({ size = 'md', className }: Omit<LogoProps, 'variant'>) {
  return <Logo variant="text" size={size} className={className} />
}

export function LogoFull({ size = 'md', className }: Omit<LogoProps, 'variant'>) {
  return <Logo variant="full" size={size} className={className} />
}

// Loading logo with animation
export function LogoLoading({ size = 'lg' }: { size?: LogoProps['size'] }) {
  return (
    <div className="flex items-center justify-center">
      <Logo variant="icon" size={size} animate />
    </div>
  )
}

// Brand header with PM V3 text
export function LogoBrand({ size = 'md', showVersion = true }: { 
  size?: LogoProps['size']
  showVersion?: boolean 
}) {
  return (
    <div className="flex items-center gap-2">
      <Logo variant="full" size={size} />
      {showVersion && (
        <span className="text-gray-700 text-sm font-medium">V3</span>
      )}
    </div>
  )
}