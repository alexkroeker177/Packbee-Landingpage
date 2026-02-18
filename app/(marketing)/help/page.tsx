import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Help Center</h1>

        <form action="/help" method="GET" className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Search help articles..."
              defaultValue={q}
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 rounded text-sm font-medium hover:bg-yellow-500"
            >
              Search
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mb-4">
          Search results for &ldquo;{q}&rdquo;
          {' — '}
          <Link href="/help" className="underline hover:text-gray-700">
            Clear search
          </Link>
        </p>

        {results.docs.length === 0 ? (
          <p className="text-gray-500">No results found for &ldquo;{q}&rdquo;.</p>
        ) : (
          <ul>
            {results.docs.map((result) => {
              const slug =
                typeof result.doc?.value === 'object' && result.doc.value !== null
                  ? (result.doc.value as { slug?: string }).slug
                  : undefined
              return (
                <li key={result.id} className="py-3 border-b last:border-b-0">
                  {slug ? (
                    <Link
                      href={`/help/${slug}`}
                      className="font-medium hover:underline"
                    >
                      {result.title}
                    </Link>
                  ) : (
                    <span className="font-medium">{result.title}</span>
                  )}
                  {result.excerpt && (
                    <p className="text-sm text-gray-600 mt-1">{result.excerpt}</p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>

      <form action="/help" method="GET" className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Search help articles..."
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-400 rounded text-sm font-medium hover:bg-yellow-500"
          >
            Search
          </button>
        </div>
      </form>

      {sectionsWithArticles.length === 0 ? (
        <p className="text-gray-500">No articles published yet.</p>
      ) : (
        sectionsWithArticles.map(({ section, articles }) => (
          <section key={section.id} className="mt-8">
            <h2 className="text-2xl font-bold mb-2">
              <Link href={`/help/${section.slug}`} className="hover:underline">
                {section.title}
              </Link>
            </h2>
            {section.description && (
              <p className="text-gray-600 mb-4 text-sm">{section.description}</p>
            )}
            <ul>
              {articles.map((article) => (
                <li key={article.id} className="py-2 border-b last:border-b-0">
                  <Link
                    href={`/help/${article.slug}`}
                    className="font-medium hover:underline"
                  >
                    {article.title}
                  </Link>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 mt-0.5">{article.excerpt}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
