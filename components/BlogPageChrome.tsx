import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export function BlogPageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[var(--color-section-a)]">
      <Navbar />
      <main className="pt-24 flex-1">{children}</main>
      <Footer />
    </div>
  )
}
