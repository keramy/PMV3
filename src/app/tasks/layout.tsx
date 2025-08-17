import { LayoutWithSidebar } from '@/components/layout/LayoutWithSidebar'

interface TasksLayoutProps {
  children: React.ReactNode
}

export default function TasksLayout({ children }: TasksLayoutProps) {
  return (
    <LayoutWithSidebar>
      {children}
    </LayoutWithSidebar>
  )
}