import { LayoutWithSidebar } from '@/components/layout/LayoutWithSidebar'

interface MaterialSpecsLayoutProps {
  children: React.ReactNode
}

export default function MaterialSpecsLayout({ children }: MaterialSpecsLayoutProps) {
  return (
    <LayoutWithSidebar>
      {children}
    </LayoutWithSidebar>
  )
}