/**
 * Main Navigation Component - Mobile-First Design
 * Optimized for construction site usage with touch targets
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2,
  LayoutDashboard,
  Settings,
  Users,
  Menu,
  Search
} from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Logo } from '@/components/ui/logo'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' as const, icon: LayoutDashboard },
  { name: 'Projects', href: '/projects' as const, icon: Building2 },
  { name: 'Team', href: '/team' as const, icon: Users },
  { name: 'Admin', href: '/admin' as const, icon: Settings },
]

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center justify-between", className)}>
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center">
        <Logo variant="auto" size="md" />
      </Link>

      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:flex items-center space-x-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link key={item.name} href={item.href}>
              <Button 
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2 mobile-touch-target"
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Search - Desktop only */}
        <Button variant="ghost" size="sm" className="hidden md:flex mobile-touch-target hover:bg-gray-200">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <NotificationBell className="mobile-touch-target" />

        {/* Mobile Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="mobile-touch-target hover:bg-gray-200">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuItem className="md:hidden">
                <Search className="h-4 w-4 mr-2" />
                <span>Search</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}