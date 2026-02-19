import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export function BlogPageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[var(--color-section-a)]">
      <Navbar />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  )
}
