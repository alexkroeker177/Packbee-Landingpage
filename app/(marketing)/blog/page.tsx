import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BlogPageChrome } from '@/components/BlogPageChrome'

export const metadata: Metadata = {
  title: 'Blog | PackBee',
  description:
    'Tips, tutorials, and insights about e-commerce fulfillment, pick-and-pack verification, and shipping optimization.',
}

type SearchParams = Promise<{ page?: string }>

export default async function BlogListingPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 10,
    page: currentPage,
    overrideAccess: false,
    where: {
      and: [
        { _status: { equals: 'published' } },
        { 'meta.noIndex': { not_equals: true } },
      ],
    },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      author: true,
    },
    sort: '-publishedAt',
  })

  return (
    <BlogPageChrome>
      {/* Branded page header with honeycomb texture */}
      <section className="relative bg-[var(--color-section-a)] overflow-hidden py-16 px-6">
        <div className="absolute inset-0 bg-honeycomb opacity-[0.07] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">Blog</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">Insights and tutorials for e-commerce fulfillment</p>
        </div>
      </section>

      {/* Cross-navigation tab strip */}
      <div className="border-b border-[var(--color-border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 flex gap-6">
          <Link href="/blog" className="py-3 text-sm font-medium border-b-2 border-[var(--color-primary-500)] text-[var(--color-text-primary)]">
            Blog
          </Link>
          <Link href="/help" className="py-3 text-sm font-medium border-b-2 border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            Help Center
          </Link>
        </div>
      </div>

      {/* Card grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {posts.docs.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.docs.map((post) => {
              const authorName =
                typeof post.author === 'object' && post.author !== null ? post.author.name : ''
              const featuredImage =
                typeof post.featuredImage === 'object' && post.featuredImage !== null
                  ? post.featuredImage
                  : null
              const formattedDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : null

              return (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-shadow">
                  {featuredImage?.url && (
                    <img src={featuredImage.url} alt={featuredImage.alt ?? ''} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-5">
                    <h2 className="font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-[var(--color-primary-700)] transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 mb-4">{post.excerpt}</p>
                    )}
                    <div className="text-xs text-[var(--color-text-muted)] flex gap-2">
                      {authorName && <span>{authorName}</span>}
                      {authorName && formattedDate && <span>&middot;</span>}
                      {formattedDate && <span>{formattedDate}</span>}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Pagination controls */}
        {posts.totalPages > 1 && (
          <nav className="flex gap-4 mt-8 items-center justify-center">
            {posts.page && posts.page > 1 && (
              <Link
                href={`/blog?page=${posts.page - 1}`}
                className="px-4 py-2 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-50)] text-[var(--color-text-primary)]"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-[var(--color-text-muted)]">
              Page {posts.page} of {posts.totalPages}
            </span>
            {posts.page && posts.page < posts.totalPages && (
              <Link
                href={`/blog?page=${posts.page + 1}`}
                className="px-4 py-2 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-50)] text-[var(--color-text-primary)]"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </div>
    </BlogPageChrome>
  )
}
