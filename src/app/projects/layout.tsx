import { LayoutWithSidebar } from '@/components/layout/LayoutWithSidebar'

interface ProjectsLayoutProps {
  children: React.ReactNode
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <LayoutWithSidebar>
      {children}
    </LayoutWithSidebar>
  )
}