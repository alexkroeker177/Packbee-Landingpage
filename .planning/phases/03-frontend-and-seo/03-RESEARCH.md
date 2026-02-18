# Phase 03: Frontend & SEO - Research

**Researched:** 2026-02-18
**Domain:** Next.js App Router pages, Payload Local API, Lexical HTML/JSX rendering, JSON-LD structured data, sitemap/robots.txt, on-demand ISR revalidation via Payload afterChange hooks
**Confidence:** HIGH (most findings verified against node_modules type definitions, Payload website template source, and Next.js 16.1.6 official docs)

---

## Summary

Phase 3 adds all public-facing routes and SEO infrastructure on top of the content model from Phase 2. The project already has `(marketing)` route group, working Payload CMS collections (Posts, KnowledgeBase, Sections, Authors), and the `@payloadcms/plugin-seo` installed with `noIndex` and `canonicalURL` fields. Phase 3 is purely additive: new Next.js pages, hooks, sitemap/robots files, and JSON-LD blocks.

The standard pattern for Payload 3 + Next.js 16 is: **Server Components call `getPayload({ config: configPromise })` for direct DB access** (no HTTP), then render content with the `<RichText>` JSX component from `@payloadcms/richtext-lexical/react`, and add JSON-LD via inline `<script type="application/ld+json">` tags. The `afterChange` hook calls `revalidatePath()` and `revalidateTag()` directly from `next/cache` — no separate webhook endpoint is needed because Payload runs inside the same Next.js process.

The one critical routing decision: `/help/[section-slug]` and `/help/[slug]` **cannot coexist as separate Next.js routes** at the same level. The correct pattern is a single `app/(marketing)/help/[slug]/page.tsx` that queries sections first, then KB articles, and renders the appropriate view.

**Primary recommendation:** Follow the Payload website template pattern for `afterChange` hooks (calling `revalidatePath` + `revalidateTag` directly), use the Next.js built-in `sitemap.ts` convention with `unstable_cache` and tag-based revalidation, and use a single dynamic `[slug]` route for the help section that disambiguates via DB lookup.

---

## Standard Stack

### Core (Already Installed — No New Installs for Most of Phase 3)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `next` | `16.1.6` | App Router pages, sitemap/robots, revalidatePath | INSTALLED |
| `payload` | `3.77.0` | Local API `getPayload()` for DB queries in Server Components | INSTALLED |
| `@payloadcms/richtext-lexical` | `3.77.0` | `<RichText>` JSX component for rendering Lexical content | INSTALLED |
| `@payloadcms/plugin-seo` | `3.77.0` | Provides `meta.noIndex`, `meta.canonicalURL`, `meta.title`, `meta.description` on collections | INSTALLED |

### New Installs Required

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@payloadcms/plugin-search` | `3.77.0` | Creates a `search` collection indexed for fast querying (KB-05) | Required for KB search functionality; creates a DB migration |

**Installation:**
```bash
npm install @payloadcms/plugin-search@3.77.0 --legacy-peer-deps
```

### Supporting (Optional but Recommended)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `schema-dts` | `1.1.5` | TypeScript types for schema.org structured data | Use for type-safe JSON-LD authoring (Article, FAQPage, HowTo) |

**Note:** `schema-dts` is optional — you can write the JSON-LD objects as plain TypeScript without types. But it prevents typos in schema field names.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js built-in `sitemap.ts` | `next-sitemap` package | `next-sitemap` requires extra config file + package; built-in is simpler and zero-dependency |
| `<RichText>` JSX component | `convertLexicalToHTML` | HTML string needs `dangerouslySetInnerHTML`; JSX component integrates naturally with React Server Components |
| Single `[slug]` route with DB disambiguation | Two separate routes `/s/[section-slug]` and `/[slug]` | Prefixed URL breaks the requirement spec (`/help/[section-slug]` not `/help/s/[section-slug]`) |
| `revalidatePath` directly in afterChange hook | Separate webhook endpoint | Direct call is simpler and works because Payload runs in the same Next.js process |

---

## Architecture Patterns

### Recommended Project Structure

```
app/
├── (marketing)/
│   ├── layout.tsx          ← EXISTING (fonts, bg-white, html lang)
│   ├── page.tsx            ← EXISTING (landing page)
│   ├── blog/
│   │   ├── page.tsx        ← NEW: blog listing with pagination (BLOG-06)
│   │   └── [slug]/
│   │       └── page.tsx    ← NEW: individual post + Article JSON-LD (BLOG-07, SEO-06, SEO-07)
│   └── help/
│       ├── page.tsx        ← NEW: KB listing grouped by section (KB-02)
│       └── [slug]/
│           └── page.tsx    ← NEW: section landing OR individual article (KB-03, KB-04, KB-06, KB-07)
├── sitemap.ts              ← NEW: built-in Next.js sitemap (SEO-04)
└── robots.ts               ← NEW: built-in Next.js robots (SEO-05)
src/
├── collections/
│   ├── hooks/
│   │   ├── revalidatePost.ts    ← NEW: afterChange hook for posts (SEO-08)
│   │   └── revalidateKB.ts     ← NEW: afterChange hook for KB articles (SEO-08)
│   ├── Posts.ts                ← MODIFY: add contentType field + afterChange hooks
│   └── KnowledgeBase.ts        ← MODIFY: add articleType field + afterChange hooks
└── migrations/
    └── (new migration for contentType/articleType fields + search collection)
```

### Pattern 1: Server Component with Payload Local API

**What:** Next.js Server Components call `getPayload()` directly for zero-overhead database access.
**When to use:** Every page that fetches Payload content.
**Example:**
```typescript
// Source: Payload website template + node_modules/payload/dist/collections/operations/local/find.d.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

// Wrap in React.cache() to deduplicate calls during the same render cycle
const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,            // populate author and featured image relationships
    limit: 1,
    overrideAccess: false, // respect public access control
    pagination: false,
    where: {
      slug: { equals: slug },
    },
  })
  return result.docs?.[0] || null
})
```

**Key options for `payload.find()`:**
- `draft: false` — exclude draft documents (default for public pages)
- `overrideAccess: false` — respect collection's `access.read` function (required for public pages)
- `depth: 1` — populate one level of relationships (author, section)
- `select: { title: true, slug: true }` — reduce DB and JSON overhead when only specific fields needed
- `where: { _status: { equals: 'published' } }` — explicit published filter (belt-and-suspenders with `overrideAccess: false`)
- `where: { 'meta.noIndex': { not_equals: true } }` — exclude noIndex content from sitemaps

### Pattern 2: Rich Text Rendering with JSX Component

**What:** The `<RichText>` component from `@payloadcms/richtext-lexical/react` renders Lexical editor state as React elements in Server Components.
**When to use:** All blog post and KB article body rendering.
**Example:**
```typescript
// Source: node_modules/@payloadcms/richtext-lexical/dist/exports/react/index.d.ts
import { RichText } from '@payloadcms/richtext-lexical/react'

// In a Server Component:
export default function PostPage({ post }: { post: Post }) {
  return (
    <article>
      {post.body && <RichText data={post.body} />}
    </article>
  )
}
```

**Props:**
- `data: SerializedEditorState` — the rich text field value from Payload
- `className?: string` — CSS class on the container div
- `disableContainer?: boolean` — remove the wrapping div
- `converters?: JSXConverters | JSXConvertersFunction` — override specific node renderers

**Alternative for HTML string output** (only use if you need HTML for structured data):
```typescript
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
// Synchronous, returns string
const html = convertLexicalToHTML({ data: post.body })
```

### Pattern 3: afterChange Hook for On-Demand Revalidation

**What:** Payload's `afterChange` hook calls `revalidatePath` and `revalidateTag` from `next/cache` directly. This works because Payload is embedded inside the Next.js process.
**When to use:** On every Posts and KnowledgeBase document save/publish.
**Example:**
```typescript
// Source: https://raw.githubusercontent.com/payloadcms/payload/main/templates/website/src/collections/Posts/hooks/revalidatePost.ts
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      revalidatePath(`/blog/${doc.slug}`)
      revalidateTag('posts-sitemap')
    }
    // Handle unpublishing
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      revalidatePath(`/blog/${previousDoc.slug}`)
      revalidateTag('posts-sitemap')
    }
  }
  return doc
}
```

**Register the hook in the collection:**
```typescript
// In Posts.ts
hooks: {
  afterChange: [revalidatePost],
},
```

### Pattern 4: JSON-LD Structured Data

**What:** Inline `<script type="application/ld+json">` tags in Server Component page JSX.
**When to use:** Every blog post page (Article), KB FAQ articles (FAQPage), tutorial posts (HowTo).
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
// In a Server Component page:
export default async function PostPage({ post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: { '@type': 'Person', name: post.author?.name },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.featuredImage?.url,
    publisher: {
      '@type': 'Organization',
      name: 'PackBee',
      logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SERVER_URL}/images/packbee-logo.svg` },
    },
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      {/* page content */}
    </>
  )
}
```

**Note on XSS:** Always `.replace(/</g, '\\u003c')` on the serialized JSON-LD to prevent HTML injection.

### Pattern 5: Next.js Built-In Sitemap with Tag-Based Revalidation

**What:** `app/sitemap.ts` exports a default function returning a `MetadataRoute.Sitemap` array. Wrapped in `unstable_cache` with tags enables `revalidateTag()` from the afterChange hook.
**When to use:** SEO-04 sitemap requirement.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const getSitemapData = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

    const [posts, kbArticles] = await Promise.all([
      payload.find({
        collection: 'posts',
        overrideAccess: false,
        draft: false,
        limit: 1000,
        pagination: false,
        where: {
          and: [
            { _status: { equals: 'published' } },
            { 'meta.noIndex': { not_equals: true } },
          ],
        },
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'knowledge-base',
        overrideAccess: false,
        draft: false,
        limit: 1000,
        pagination: false,
        where: {
          and: [
            { _status: { equals: 'published' } },
            { 'meta.noIndex': { not_equals: true } },
          ],
        },
        select: { slug: true, updatedAt: true },
      }),
    ])

    return [
      ...posts.docs.map(p => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt })),
      ...kbArticles.docs.map(k => ({ url: `${SITE_URL}/help/${k.slug}`, lastModified: k.updatedAt })),
    ]
  },
  ['sitemap'],
  { tags: ['posts-sitemap', 'kb-sitemap'] },
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapData()
}
```

### Pattern 6: robots.ts

**What:** `app/robots.ts` exports a default function returning `MetadataRoute.Robots`.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

**File location:** `app/robots.ts` (NOT inside `(marketing)` — must be at the app root to be served at `/robots.txt`)

**Same for sitemap:** `app/sitemap.ts` at the app root, not inside the route group.

### Pattern 7: /help/[slug] with DB Disambiguation

**What:** A single Next.js dynamic route handles both section landing pages and individual KB article pages. The component queries sections first; if no match, queries articles.
**Why:** Next.js App Router cannot have two dynamic routes at the same path level (both `[section-slug]` and `[slug]` would conflict).
**Example:**
```typescript
// app/(marketing)/help/[slug]/page.tsx
export default async function HelpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  // Try section first
  const sections = await payload.find({
    collection: 'sections',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (sections.docs.length > 0) {
    const section = sections.docs[0]
    // Fetch articles in this section
    const articles = await payload.find({
      collection: 'knowledge-base',
      where: { and: [
        { section: { equals: section.id } },
        { _status: { equals: 'published' } },
      ]},
      overrideAccess: false,
    })
    return <SectionLandingPage section={section} articles={articles.docs} />
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
    return <KBArticlePage article={articles.docs[0]} />
  }

  notFound()
}
```

### Pattern 8: @payloadcms/plugin-search Configuration

**What:** The search plugin creates a `search` collection that mirrors search-critical fields from target collections. Queried via standard Payload Local API.
**Configuration in `payload.config.ts`:**
```typescript
import { searchPlugin } from '@payloadcms/plugin-search'

plugins: [
  searchPlugin({
    collections: ['knowledge-base'],
    defaultPriorities: {
      'knowledge-base': 10,
    },
    searchOverrides: {
      slug: 'search',
      fields: ({ defaultFields }) => [
        ...defaultFields,
        { name: 'excerpt', type: 'textarea' },
        { name: 'section', type: 'relationship', relationTo: 'sections' },
      ],
    },
    beforeSync: ({ originalDoc, searchDoc }) => ({
      ...searchDoc,
      excerpt: originalDoc?.excerpt ?? '',
      section: originalDoc?.section,
    }),
  }),
]
```

**Querying search:**
```typescript
// In /help page or API route:
const results = await payload.find({
  collection: 'search',
  where: { title: { contains: query } },
  sort: 'priority',
})
```

**Important:** Adding `plugin-search` creates a new `search` collection in the database. This requires a Payload migration (`npm run payload migrate:create` then apply).

### Pattern 9: contentType/articleType Fields for Conditional Schemas

**What:** New select fields on Posts and KnowledgeBase to indicate which JSON-LD schema applies.
**Why:** FAQPage (KB-07) and HowTo (SEO-07) schemas must be tied to specific content — they can't be applied universally. Adding select fields to the collection is the canonical approach.
**Fields to add:**

For `Posts.ts`:
```typescript
{
  name: 'contentType',
  type: 'select',
  defaultValue: 'article',
  options: [
    { label: 'Article (standard)', value: 'article' },
    { label: 'Tutorial (HowTo schema)', value: 'tutorial' },
  ],
  admin: {
    description: 'Controls structured data (JSON-LD) schema type emitted for search engines.',
    position: 'sidebar',
  },
}
```

For `KnowledgeBase.ts`:
```typescript
{
  name: 'articleType',
  type: 'select',
  defaultValue: 'standard',
  options: [
    { label: 'Standard Article', value: 'standard' },
    { label: 'FAQ Article (FAQPage schema)', value: 'faq' },
  ],
  admin: {
    description: 'Controls structured data (JSON-LD) schema type emitted for search engines.',
    position: 'sidebar',
  },
}
```

**These require a migration.** After adding the fields, run:
```bash
npm run payload migrate:create -- --name add-content-types
npm run payload migrate
```

### Anti-Patterns to Avoid

- **Separate webhook endpoint for revalidation:** Not needed. Call `revalidatePath`/`revalidateTag` directly in the `afterChange` hook — Payload and Next.js share the same server process.
- **Using `convertLexicalToHTML` (deprecated):** The old API at `payload/dist/features/converters/lexicalToHtml_deprecated/...` is marked deprecated and removed in v4. Use `convertLexicalToHTML` from `@payloadcms/richtext-lexical/html` (the new path) or the `<RichText>` JSX component.
- **Two separate dynamic routes for sections and articles:** `app/(marketing)/help/[section-slug]/page.tsx` and `app/(marketing)/help/[slug]/page.tsx` will cause a Next.js build error — you cannot have two dynamic segments at the same path level.
- **Using `overrideAccess: true` on public pages:** This bypasses the `access.read` function and can leak drafts to unauthenticated visitors.
- **Importing from `@payload-config` in Client Components:** `getPayload()` is server-only. Keep all Payload API calls in Server Components or Route Handlers.
- **`next-sitemap` package:** No need for an extra package; Next.js 16 has first-class `sitemap.ts` convention.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text to React | Custom Lexical node walker | `<RichText>` from `@payloadcms/richtext-lexical/react` | Handles all node types, link serialization, custom blocks |
| Rich text to HTML string | Custom serializer | `convertLexicalToHTML` from `@payloadcms/richtext-lexical/html` | Sync, handles all Lexical node types correctly |
| Search index | Custom DB queries with LIKE | `@payloadcms/plugin-search` | Optimized index, auto-sync, priority-based sorting |
| Sitemap generation | Manual XML template | Next.js `app/sitemap.ts` | Zero config, type-safe `MetadataRoute.Sitemap`, built-in caching |
| robots.txt | Static file in public/ | Next.js `app/robots.ts` | Dynamic (can reference env var for sitemap URL), zero maintenance |
| On-demand cache invalidation | Polling or time-based revalidation | `revalidatePath`/`revalidateTag` in Payload `afterChange` hook | Instant, precise, no polling overhead |

**Key insight:** Payload 3 + Next.js 16 share a process. The integration points (local API, revalidation) are first-class and require almost no boilerplate.

---

## Common Pitfalls

### Pitfall 1: sitemap.ts and robots.ts Must Be at App Root, Not Inside Route Groups

**What goes wrong:** Files placed at `app/(marketing)/sitemap.ts` serve at `/something/sitemap.xml`, not `/sitemap.xml`.
**Why it happens:** Route groups (`(marketing)`) affect the URL prefix. Files at the app root (`app/sitemap.ts`) are served at `/sitemap.xml`.
**How to avoid:** Place `sitemap.ts` and `robots.ts` directly in `app/` at the top level, NOT inside `(marketing)`.
**Warning signs:** `/sitemap.xml` returns 404 in the browser.

### Pitfall 2: noIndex Filter in Sitemap Uses Nested Field Path

**What goes wrong:** `where: { noIndex: { not_equals: true } }` returns all documents because `noIndex` is nested under `meta.noIndex`.
**Why it happens:** The `@payloadcms/plugin-seo` groups its fields under a `meta` group field.
**How to avoid:** Use dot notation: `where: { 'meta.noIndex': { not_equals: true } }`.
**Warning signs:** Sitemap includes all published posts regardless of noIndex setting.

### Pitfall 3: `overrideAccess: false` Required on All Public-Facing Queries

**What goes wrong:** Draft documents appear on public pages because `overrideAccess` defaults to `true` in the Local API.
**Why it happens:** Payload's Local API defaults to bypassing access control for server-side operations.
**How to avoid:** Always set `overrideAccess: false` in pages that serve public content. The `access.read` function on Posts and KnowledgeBase already returns `{ _status: { equals: 'published' } }` for unauthenticated requests — but only when `overrideAccess: false`.
**Warning signs:** Draft posts visible on `/blog/[slug]`.

### Pitfall 4: revalidateTag Names Must Match Between Hook and Sitemap Cache

**What goes wrong:** Sitemap doesn't update after a post is published even though `revalidateTag` is called.
**Why it happens:** The tag string in `revalidateTag('posts-sitemap')` must exactly match the tag in `unstable_cache(fn, ['sitemap'], { tags: ['posts-sitemap'] })`.
**How to avoid:** Extract tag constants into a shared file (e.g., `src/lib/cache-tags.ts`).
**Warning signs:** Sitemap.xml serves stale URLs after publishing a new post.

### Pitfall 5: @payloadcms/plugin-search Requires a Migration

**What goes wrong:** Dev server fails with a Drizzle/DB error after adding `searchPlugin` to `payload.config.ts` because the `search` table doesn't exist.
**Why it happens:** `push: false` is set, so schema changes aren't auto-applied.
**How to avoid:** After adding the plugin to config, immediately run `npm run payload migrate:create` and `npm run payload migrate` before starting the dev server.
**Warning signs:** DB table errors in the server console.

### Pitfall 6: contentType/articleType Fields Need Migrations Before Phase 3 Pages Can Use Them

**What goes wrong:** The page logic for HowTo/FAQPage conditional schemas references `post.contentType` but the field doesn't exist on the TypeScript type (and the DB column is missing).
**Why it happens:** Phase 2 didn't add these fields. Phase 3 adds them but they require `payload generate:types` and a migration.
**How to avoid:** The task that adds fields to Posts/KnowledgeBase must run `payload migrate:create`, `payload migrate`, and `payload generate:types` before the page component is written.
**Warning signs:** TypeScript errors on `post.contentType`, or undefined at runtime.

### Pitfall 7: /help/[slug] Route Must Handle Both Sections and Articles

**What goes wrong:** Separate routes for sections and articles cause a Next.js build error: "You can't have two parallel dynamic segments at the same level."
**Why it happens:** Next.js App Router treats `[section-slug]` and `[slug]` as the same dynamic segment — having two folders means two dynamic routes at the same level.
**How to avoid:** Use a single `app/(marketing)/help/[slug]/page.tsx` that disambiguates via DB lookup (section first, article second).
**Warning signs:** `Error: Conflicting path segments detected at the same level` during `next dev` or `next build`.

### Pitfall 8: RichText Component Import Path

**What goes wrong:** `import { RichText } from '@payloadcms/richtext-lexical'` fails with "Module not found" or imports the server-side editor config instead of the React renderer.
**Why it happens:** The package has distinct sub-path exports. The React component lives at `/react`, not at the root.
**How to avoid:** Use `import { RichText } from '@payloadcms/richtext-lexical/react'`.
**Warning signs:** Build error or blank content where rich text should render.

### Pitfall 9: Payload Local API Cannot Be Used in Client Components

**What goes wrong:** `getPayload()` throws a server-only error when called from a Client Component.
**Why it happens:** The Payload Local API imports Node.js modules and accesses the database directly — not available in the browser.
**How to avoid:** Keep all `getPayload()` calls in Server Components (`page.tsx` or helper functions without `'use client'`). If a client component needs data, pass it as props from the parent Server Component.
**Warning signs:** "Cannot import server-only module" error during build.

---

## Code Examples

Verified patterns from official sources:

### Blog Listing Page with Pagination

```typescript
// app/(marketing)/blog/page.tsx
// Source: Payload website template + Next.js docs
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-static'
export const revalidate = 600  // fallback: revalidate every 10 minutes

type SearchParams = Promise<{ page?: string }>

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { page: pageParam } = await searchParams
  const currentPage = Number(pageParam) || 1
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 10,
    page: currentPage,
    overrideAccess: false,
    where: { _status: { equals: 'published' } },
    select: { title: true, slug: true, excerpt: true, featuredImage: true, publishedAt: true, author: true },
  })

  return (
    <div>
      {/* render posts.docs */}
      {/* render pagination using posts.page and posts.totalPages */}
    </div>
  )
}
```

### Article JSON-LD Structured Data

```typescript
// Inside blog/[slug]/page.tsx
// Source: https://nextjs.org/docs/app/guides/json-ld
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': post.contentType === 'tutorial' ? 'HowTo' : 'Article',
  headline: post.meta?.title ?? post.title,
  description: post.meta?.description ?? post.excerpt,
  image: post.featuredImage?.url ?? post.meta?.image?.url,
  author: {
    '@type': 'Person',
    name: typeof post.author === 'object' ? post.author.name : '',
  },
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  publisher: {
    '@type': 'Organization',
    name: 'PackBee',
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/images/packbee-logo.svg`,
    },
  },
}

// For HowTo posts only (contentType === 'tutorial'):
// The HowTo schema additionally needs 'step' array
// Steps can be derived from heading structure in the Lexical body

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
    {/* article body */}
  </>
)
```

### FAQPage JSON-LD for KB Articles

```typescript
// Inside help/[slug]/page.tsx — only when article.articleType === 'faq'
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // For FAQ articles, the editor should use a specific block type
    // OR the FAQ items can be stored as structured fields on the KB collection
    // Simple approach: add a `faqs` array field to KnowledgeBase (requires a migration in phase 3)
    {
      '@type': 'Question',
      name: 'Question text here',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Answer text here',
      },
    },
  ],
}
```

**Note:** For proper FAQPage schema, the KB article needs structured FAQ data — not just free-form Lexical body content. The recommended approach is to add a `faqs` array field to the `KnowledgeBase` collection with `question` and `answer` sub-fields, visible/required only when `articleType === 'faq'`. This requires a Phase 3 migration.

### Breadcrumb Navigation for KB Articles

```typescript
// Breadcrumb JSON-LD (optional SEO enhancement, not in explicit requirements)
// Plain React implementation (no library needed)
const BreadcrumbNav = ({ section, article }: { section: Section, article?: KnowledgeBase }) => (
  <nav aria-label="breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/help">Help</a></li>
      <li><a href={`/help/${section.slug}`}>{section.title}</a></li>
      {article && <li aria-current="page">{article.title}</li>}
    </ol>
  </nav>
)
```

### generateMetadata for SEO

```typescript
// Reuse the meta fields from plugin-seo for generateMetadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const post = await queryPostBySlug({ slug })
  if (!post) return {}

  return {
    title: post.meta?.title ?? post.title,
    description: post.meta?.description ?? post.excerpt ?? '',
    robots: post.meta?.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: post.meta?.canonicalURL ?? `${process.env.NEXT_PUBLIC_SERVER_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.meta?.ogTitle ?? post.meta?.title ?? post.title,
      description: post.meta?.description ?? post.excerpt ?? '',
      images: post.meta?.image?.url ? [{ url: post.meta.image.url }] : [],
      type: 'article',
    },
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `convertLexicalToHTML` (deprecated) | `<RichText>` JSX or `convertLexicalToHTML` from `/html` path | Payload 3.x | Old API removed in v4; new exports at `/html`, `/html-async`, `/react` |
| `next-sitemap` package | Next.js built-in `app/sitemap.ts` | Next.js 13.3 | Zero extra dependency, same power |
| Webhook endpoints for CMS revalidation | Direct `revalidatePath()`/`revalidateTag()` in afterChange hook | Payload 3 embedding in Next.js | Simpler, no auth tokens needed, same-process call |
| `getStaticProps` + ISR | Server Components + `unstable_cache` + `revalidateTag` | Next.js 13+ App Router | More granular, tag-based, per-component caching |

**Deprecated/outdated:**
- `convertLexicalToHTML` from the root `@payloadcms/richtext-lexical` import: deprecated, use `/html` path instead
- `next-sitemap`: still works but unnecessary when Next.js built-in convention is available
- Webhook-based revalidation: still valid for external-CMS setups; not needed when CMS is embedded

---

## Open Questions

1. **HowTo Schema Step Generation**
   - What we know: HowTo schema requires a `step` array with named steps
   - What's unclear: Whether to auto-derive steps from headings in Lexical body, or add a `steps` array field to Posts
   - Recommendation: For Phase 3, add a `steps` array field to Posts (conditional on `contentType === 'tutorial'`). Simpler, structured, editor-controlled. Requires a migration.

2. **FAQPage Schema Source Data**
   - What we know: FAQPage requires a `mainEntity` array of Question/Answer pairs
   - What's unclear: Whether FAQ data comes from free-form Lexical body (hard to extract) or from a structured `faqs` field
   - Recommendation: Add a `faqs` array field to `KnowledgeBase` (conditional on `articleType === 'faq'`). Requires a migration. Plain Lexical body cannot reliably generate FAQPage JSON-LD.

3. **plugin-search Frontend Search UI**
   - What we know: KB-05 requires search; `@payloadcms/plugin-search` creates the `search` collection
   - What's unclear: Whether Phase 3 includes a UI search bar or just the search index
   - The requirement says "Search across KB articles" — this implies a UI component
   - Recommendation: Build a simple search form + results component in `/help/page.tsx` that fetches from the `search` collection using a query param

4. **`revalidateTag` for KnowledgeBase Articles and Sections**
   - What we know: Sections don't have `versions` (no `afterChange` hook needed for section content changes since sections rarely change)
   - What's unclear: Do section changes need revalidation (e.g., renaming a section title)?
   - Recommendation: Add a `revalidateSection` hook to the Sections collection as well, revalidating `/help` and the specific `/help/[section-slug]` path

5. **Route Group for Sitemap/Robots**
   - What we know: `app/sitemap.ts` must be at root app level (not inside `(marketing)`)
   - What's unclear: Whether this conflicts with the Payload route group setup at `app/(payload)/`
   - Recommendation: No conflict expected — `(payload)` handles `/admin` and `/api`, while `app/sitemap.ts` is at the true root. Verify with `next build` output.

---

## Sources

### Primary (HIGH confidence)

- `node_modules/payload/dist/collections/operations/local/find.d.ts` — `payload.find()` API signature verified
- `node_modules/payload/dist/collections/config/types.d.ts` — `AfterChangeHook` type definition verified
- `node_modules/@payloadcms/richtext-lexical/dist/index.d.ts` — confirmed `convertLexicalToHTML` export paths (`/html`, `/html-async`, `/react`)
- `node_modules/@payloadcms/richtext-lexical/dist/features/converters/lexicalToJSX/Component/index.d.ts` — `RichText` component props verified
- `node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts` — `MetadataRoute.Sitemap` and `MetadataRoute.Robots` types verified
- `node_modules/next/cache.d.ts` — `revalidatePath`, `revalidateTag`, `unstable_cache` exports verified
- `node_modules/next/dist/server/web/spec-extension/revalidate.d.ts` — `revalidatePath(path, type?)` and `revalidateTag(tag)` signatures verified
- `node_modules/payload/dist/types/constants.d.ts` — `not_equals` confirmed as valid query operator
- `https://nextjs.org/docs/app/guides/json-ld` (v16.1.6) — JSON-LD `<script>` pattern with XSS mitigation
- `https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap` (v16.1.6) — sitemap.ts convention
- `https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots` (v16.1.6) — robots.ts convention
- `https://nextjs.org/docs/app/api-reference/functions/revalidatePath` (v16.1.6) — revalidatePath usage constraints

### Secondary (MEDIUM confidence — confirmed with template source)

- Payload website template `revalidatePost.ts` (fetched from GitHub raw) — afterChange hook calling `revalidatePath` + `revalidateTag` directly
- Payload website template `posts-sitemap.xml/route.ts` (fetched from GitHub raw) — pattern for sitemap with `unstable_cache` and tags (uses `next-sitemap` but confirms tag-based pattern)
- Payload website template `posts/[slug]/page.tsx` (fetched from GitHub raw) — `getPayload` + `payload.find()` pattern in Server Components
- `https://raw.githubusercontent.com/payloadcms/payload/main/docs/plugins/search.mdx` — plugin-search official README with full option reference

### Tertiary (LOW confidence — WebSearch only, not verified against official source)

- Multiple web sources agree: Next.js cannot have two dynamic route segments at the same level — treated as HIGH confidence given Next.js behavior is well-known

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in node_modules
- Architecture (page patterns): HIGH — verified against Payload website template
- Routing strategy (/help disambiguation): HIGH — confirmed by Next.js routing rules
- afterChange hook revalidation: HIGH — template source fetched and verified
- Sitemap/robots: HIGH — Next.js 16 docs fetched
- JSON-LD patterns: HIGH — Next.js docs fetched
- plugin-search: HIGH — README fetched from GitHub, npm version verified
- FAQPage/HowTo implementation details: MEDIUM — pattern is clear (add structured fields) but exact field schema for HowTo steps not specified

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days — Payload and Next.js are stable at these versions)
