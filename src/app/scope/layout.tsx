import { LayoutWithSidebar } from '@/components/layout/LayoutWithSidebar'

interface ScopeLayoutProps {
  children: React.ReactNode
}

export default function ScopeLayout({ children }: ScopeLayoutProps) {
  return (
    <LayoutWithSidebar>
      {children}
    </LayoutWithSidebar>
  )
}