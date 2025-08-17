import { LayoutWithSidebar } from '@/components/layout/LayoutWithSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <LayoutWithSidebar>
      {children}
    </LayoutWithSidebar>
  )
}