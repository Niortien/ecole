import { SiteFooter } from '@/components/vitrine/site-footer'
import { SiteHeader } from '@/components/vitrine/site-header'

export default function VitrineLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  )
}
