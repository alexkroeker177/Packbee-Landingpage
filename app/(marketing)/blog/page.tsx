import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

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
    where: { _status: { equals: 'published' } },
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>

      {posts.docs.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div>
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
              <article key={post.id} className="border-b py-6">
                {featuredImage?.url && (
                  <img
                    src={featuredImage.url}
                    alt={featuredImage.alt ?? ''}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                )}
                <h2 className="text-xl font-semibold mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && <p className="text-gray-600 mb-2">{post.excerpt}</p>}
                <div className="text-sm text-gray-400 flex gap-2">
                  {authorName && <span>{authorName}</span>}
                  {authorName && formattedDate && <span>·</span>}
                  {formattedDate && <span>{formattedDate}</span>}
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
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {posts.page} of {posts.totalPages}
          </span>
          {posts.page && posts.page < posts.totalPages && (
            <Link
              href={`/blog?page=${posts.page + 1}`}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
