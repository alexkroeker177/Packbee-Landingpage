import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BlogPageChrome } from '@/components/BlogPageChrome'
import { Search, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Help Center | PackBee',
  description:
    'Find answers, tutorials, and guides about using PackBee for pick-and-pack verification.',
}

type SearchParams = Promise<{ q?: string }>

export default async function HelpListingPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q?.trim() ?? ''

  const payload = await getPayload({ config: configPromise })

  // Shared hero section
  const SearchHero = (
    <section className="relative bg-[var(--color-section-b)] bg-honeycomb overflow-hidden py-16 px-6">
      <div className="relative max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-6">Help Center</h1>
        <p className="text-lg text-[var(--color-text-secondary)] mb-8">Find answers, tutorials, and guides about using PackBee</p>
        <form action="/help" method="GET" className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              name="q"
              placeholder="Search help articles..."
              defaultValue={q || undefined}
              className="w-full border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-3 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
            />
          </div>
          <button type="submit" className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-xl px-6 py-3 font-medium transition-colors">
            Search
          </button>
        </form>
      </div>
    </section>
  )

  // Cross-navigation tab strip
  const TabStrip = (
    <div className="border-b border-[var(--color-border)] bg-white">
      <div className="max-w-6xl mx-auto px-6 flex gap-6">
        <Link href="/blog" className="py-3 text-sm font-medium border-b-2 border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
          Blog
        </Link>
        <Link href="/help" className="py-3 text-sm font-medium border-b-2 border-[var(--color-primary-500)] text-[var(--color-text-primary)]">
          Help Center
        </Link>
      </div>
    </div>
  )

  // Search mode
  if (q) {
    const results = await payload.find({
      collection: 'search',
      where: { title: { contains: q } },
      depth: 1,
      limit: 50,
      sort: '-priority',
    })

    return (
      <BlogPageChrome>
        {SearchHero}
        {TabStrip}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Search results for &ldquo;{q}&rdquo;
            {' — '}
            <Link href="/help" className="text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)] transition-colors">
              Clear search
            </Link>
          </p>

          {results.docs.length === 0 ? (
            <p className="text-[var(--color-text-muted)]">No results found for &ldquo;{q}&rdquo;.</p>
          ) : (
            <ul className="space-y-2">
              {results.docs.map((result) => {
                const slug =
                  typeof result.doc?.value === 'object' && result.doc.value !== null
                    ? (result.doc.value as { slug?: string }).slug
                    : undefined
                return (
                  <li key={result.id} className="py-3 border-b border-[var(--color-border)] last:border-b-0">
                    {slug ? (
                      <Link
                        href={`/help/${slug}`}
                        className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary-700)] transition-colors"
                      >
                        {result.title}
                      </Link>
                    ) : (
                      <span className="font-medium text-[var(--color-text-primary)]">{result.title}</span>
                    )}
                    {result.excerpt && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{result.excerpt}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </BlogPageChrome>
    )
  }

  // Browse mode — fetch all sections, then articles per section
  const sections = await payload.find({
    collection: 'sections',
    limit: 100,
    pagination: false,
    sort: 'title',
  })

  const articlesBySection = await Promise.all(
    sections.docs.map(async (section) => {
      const articles = await payload.find({
        collection: 'knowledge-base',
        where: {
          and: [
            { section: { equals: section.id } },
            { _status: { equals: 'published' } },
            { 'meta.noIndex': { not_equals: true } },
          ],
        },
        overrideAccess: false,
        depth: 0,
        select: { title: true, slug: true, excerpt: true },
        sort: 'title',
      })
      return { section, articles: articles.docs }
    }),
  )

  // Only show sections that have at least one published article
  const sectionsWithArticles = articlesBySection.filter((s) => s.articles.length > 0)

  return (
    <BlogPageChrome>
      {SearchHero}
      {TabStrip}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {sectionsWithArticles.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">No articles published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionsWithArticles.map(({ section, articles }) => (
              <Link key={section.id} href={`/help/${section.slug}`}
                className="bg-[var(--color-surface-50)] border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-primary-700)] transition-colors">{section.title}</h2>
                {section.description && (
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">{section.description}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <span>{articles.length} {articles.length === 1 ? 'article' : 'articles'}</span>
                  <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </BlogPageChrome>
  )
}
