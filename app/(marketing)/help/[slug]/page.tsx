import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { KnowledgeBase, Section } from '@/payload-types'
import { BlogPageChrome } from '@/components/BlogPageChrome'
import { ChevronRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Data fetching — wrapped in React.cache() so generateMetadata and page share
// a single request per render.
// ---------------------------------------------------------------------------

const queryBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })

  // Try section first — section slugs take priority over article slugs
  const sections = await payload.find({
    collection: 'sections',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (sections.docs.length > 0) {
    const section = sections.docs[0]
    const articles = await payload.find({
      collection: 'knowledge-base',
      where: {
        and: [
          { section: { equals: section.id } },
          { _status: { equals: 'published' } },
        ],
      },
      overrideAccess: false,
      depth: 0,
      select: { title: true, slug: true, excerpt: true },
      sort: 'title',
    })
    return { type: 'section' as const, section, articles: articles.docs }
  }

  // Try article
  const articles = await payload.find({
    collection: 'knowledge-base',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1, // populate section for breadcrumbs
    overrideAccess: false,
  })

  if (articles.docs.length > 0) {
    return { type: 'article' as const, article: articles.docs[0] }
  }

  return null
})

// ---------------------------------------------------------------------------
// Static params — pre-render all section slugs + published KB article slugs
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const [sections, articles] = await Promise.all([
    payload.find({
      collection: 'sections',
      limit: 100,
      pagination: false,
      select: { slug: true },
    }),
    payload.find({
      collection: 'knowledge-base',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: { slug: true },
    }),
  ])
  return [
    ...sections.docs.map(({ slug }) => ({ slug })),
    ...articles.docs.map(({ slug }) => ({ slug })),
  ]
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
  const data = await queryBySlug(slug)
  if (!data) return {}

  const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

  if (data.type === 'section') {
    const { section } = data
    return {
      title: `${section.title} | Help | PackBee`,
      description: section.description ?? undefined,
      alternates: { canonical: `${SITE_URL}/help/${section.slug}` },
    }
  }

  // Article metadata
  const { article } = data
  const metaImage =
    typeof article.meta?.image === 'object' && article.meta.image !== null
      ? article.meta.image.url
      : undefined

  return {
    title: article.meta?.title ?? `${article.title} | Help | PackBee`,
    description: article.meta?.description ?? article.excerpt ?? '',
    robots: article.meta?.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: article.meta?.canonicalURL ?? `${SITE_URL}/help/${article.slug}`,
    },
    openGraph: {
      type: 'article',
      title: article.meta?.ogTitle ?? article.meta?.title ?? article.title,
      description: article.meta?.description ?? article.excerpt ?? '',
      ...(metaImage ? { images: [{ url: metaImage }] } : {}),
    },
  }
}

// ---------------------------------------------------------------------------
// Section landing page
// ---------------------------------------------------------------------------

function SectionLanding({
  section,
  articles,
}: {
  section: Section
  articles: Pick<KnowledgeBase, 'id' | 'title' | 'slug' | 'excerpt'>[]
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
          <li><Link href="/" className="hover:text-[var(--color-primary-700)] transition-colors">Home</Link></li>
          <li><ChevronRight size={14} /></li>
          <li><Link href="/help" className="hover:text-[var(--color-primary-700)] transition-colors">Help</Link></li>
          <li><ChevronRight size={14} /></li>
          <li className="text-[var(--color-text-primary)] font-medium" aria-current="page">{section.title}</li>
        </ol>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{section.title}</h1>
      {section.description && (
        <p className="text-[var(--color-text-secondary)] mb-8 text-lg">{section.description}</p>
      )}

      {articles.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No articles in this section yet.</p>
      ) : (
        <ul className="space-y-2">
          {articles.map((article) => (
            <li key={article.id}>
              <Link href={`/help/${article.slug}`}
                className="block p-4 rounded-xl border border-[var(--color-border)] hover:shadow-sm hover:bg-[var(--color-surface-50)] transition-all group">
                <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-700)] transition-colors">{article.title}</span>
                {article.excerpt && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{article.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Article page
// ---------------------------------------------------------------------------

function ArticlePage({ article }: { article: KnowledgeBase }) {
  // Resolve populated section relationship
  const section =
    typeof article.section === 'object' && article.section !== null
      ? article.section
      : null

  // FAQPage JSON-LD — only for faq article type with faqs present
  const hasFaqs = article.articleType === 'faq' && (article.faqs?.length ?? 0) > 0

  const faqJsonLd = hasFaqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: (article.faqs ?? []).map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
            <li><Link href="/" className="hover:text-[var(--color-primary-700)] transition-colors">Home</Link></li>
            <li><ChevronRight size={14} /></li>
            <li><Link href="/help" className="hover:text-[var(--color-primary-700)] transition-colors">Help</Link></li>
            {section && (
              <>
                <li><ChevronRight size={14} /></li>
                <li><Link href={`/help/${section.slug}`} className="hover:text-[var(--color-primary-700)] transition-colors">{section.title}</Link></li>
              </>
            )}
            <li><ChevronRight size={14} /></li>
            <li className="text-[var(--color-text-primary)] font-medium" aria-current="page">{article.title}</li>
          </ol>
        </nav>

        <article>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-8">{article.title}</h1>

          {article.body && (
            <div className="prose prose-lg prose-amber max-w-none">
              <RichText data={article.body} />
            </div>
          )}

          {/* Visible FAQ section for faq-type articles */}
          {hasFaqs && (
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Frequently Asked Questions</h2>
              {(article.faqs ?? []).map((faq) => (
                <div key={faq.id} className="p-4 bg-[var(--color-surface-50)] rounded-xl mb-3">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">{faq.question}</h3>
                  <p className="text-[var(--color-text-secondary)]">{faq.answer}</p>
                </div>
              ))}
            </section>
          )}
        </article>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page component — DB disambiguation entry point
// ---------------------------------------------------------------------------

export default async function HelpPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await queryBySlug(slug)
  if (!data) notFound()

  if (data.type === 'section') {
    return (
      <BlogPageChrome>
        <SectionLanding section={data.section} articles={data.articles} />
      </BlogPageChrome>
    )
  }

  return (
    <BlogPageChrome>
      <ArticlePage article={data.article} />
    </BlogPageChrome>
  )
}
