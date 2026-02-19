import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { BlogPageChrome } from '@/components/BlogPageChrome'

// ---------------------------------------------------------------------------
// Data fetching — wrapped in React.cache() so generateMetadata and page share
// a single request per render.
// ---------------------------------------------------------------------------

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] ?? null
})

// ---------------------------------------------------------------------------
// Static params — pre-render all published post slugs at build time
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return posts.docs.map(({ slug }) => ({ slug }))
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await queryPostBySlug({ slug })
  if (!post) return {}

  const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const metaImage =
    typeof post.meta?.image === 'object' && post.meta.image !== null
      ? post.meta.image.url
      : undefined

  return {
    title: post.meta?.title ?? post.title,
    description: post.meta?.description ?? post.excerpt ?? '',
    robots: post.meta?.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: post.meta?.canonicalURL ?? `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.meta?.ogTitle ?? post.meta?.title ?? post.title,
      description: post.meta?.description ?? post.excerpt ?? '',
      ...(metaImage ? { images: [{ url: metaImage }] } : {}),
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await queryPostBySlug({ slug })
  if (!post) notFound()

  const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  // Resolve populated relationships
  const author =
    typeof post.author === 'object' && post.author !== null ? post.author : null
  const featuredImage =
    typeof post.featuredImage === 'object' && post.featuredImage !== null
      ? post.featuredImage
      : null
  const authorAvatar =
    author && typeof author.avatar === 'object' && author.avatar !== null
      ? author.avatar
      : null

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  // ---------------------------------------------------------------------------
  // JSON-LD structured data
  // ---------------------------------------------------------------------------
  const orgPublisher = {
    '@type': 'Organization',
    name: 'PackBee',
    url: SITE_URL,
  }

  const metaImageUrl =
    typeof post.meta?.image === 'object' && post.meta.image !== null
      ? post.meta.image.url
      : featuredImage?.url ?? undefined

  let jsonLd: Record<string, unknown>

  if (post.contentType === 'tutorial') {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: post.title,
      description: post.excerpt ?? '',
      ...(metaImageUrl ? { image: metaImageUrl } : {}),
      step: (post.steps ?? []).map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.description,
      })),
    }
  } else {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      ...(metaImageUrl ? { image: metaImageUrl } : {}),
      datePublished: post.publishedAt ?? post.createdAt,
      dateModified: post.updatedAt,
      author: author
        ? { '@type': 'Person', name: author.name }
        : undefined,
      publisher: orgPublisher,
    }
  }

  return (
    <BlogPageChrome>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <article className="max-w-2xl mx-auto px-4 py-12">
        {/* Featured image — contained with rounded corners */}
        {featuredImage?.url && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img src={featuredImage.url} alt={featuredImage.alt ?? ''} className="w-full h-64 md:h-96 object-cover" />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{post.title}</h1>

        <div className="flex gap-3 text-sm text-[var(--color-text-muted)] mb-8 pb-8 border-b border-[var(--color-border)]">
          {author && <span>{author.name}</span>}
          {author && formattedDate && <span>&middot;</span>}
          {formattedDate && <span>{formattedDate}</span>}
        </div>

        {/* Rich text body with prose-amber */}
        {post.body && (
          <div className="prose prose-lg prose-amber max-w-none">
            <RichText data={post.body} />
          </div>
        )}

        {/* Featured author bio card */}
        {author && (
          <div className="mt-12 p-6 bg-[var(--color-section-d)] rounded-2xl border border-[var(--color-border)] flex gap-4 items-start">
            {authorAvatar?.url && (
              <img src={authorAvatar.url} alt={author.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
            )}
            <div>
              <strong className="block text-base font-semibold text-[var(--color-text-primary)]">{author.name}</strong>
              {author.role && <span className="text-sm text-[var(--color-text-secondary)] block mb-1">{author.role}</span>}
              {author.bio && <p className="text-sm text-[var(--color-text-secondary)] mt-1">{author.bio}</p>}
            </div>
          </div>
        )}
      </article>
    </BlogPageChrome>
  )
}
