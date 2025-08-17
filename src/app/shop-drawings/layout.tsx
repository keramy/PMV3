import { LayoutWithSidebar } from '@/components/layout/LayoutWithSidebar'

interface ShopDrawingsLayoutProps {
  children: React.ReactNode
}

export default function ShopDrawingsLayout({ children }: ShopDrawingsLayoutProps) {
  return (
    <LayoutWithSidebar>
      {children}
    </LayoutWithSidebar>
  )
}