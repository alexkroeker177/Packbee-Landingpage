# Technology Stack: Payload CMS Blog + Knowledge Base

**Project:** PackBee Landing Page — Blog & Knowledge Base
**Researched:** 2026-02-18
**Research type:** Stack dimension (subsequent milestone, not new project)
**Overall confidence:** HIGH (verified against npm registry, GitHub releases, and official docs)

---

## Context

Adding Payload CMS 3.x to an **existing** Next.js 16 + React 19 + Tailwind CSS 4 landing page. The goal is a blog, knowledge base, author profiles, and categories/tags — all content-managed via Payload's admin panel. Database is a dedicated Supabase PostgreSQL instance (separate from the main product DB). Media stored on the local filesystem. SEO is a first-class concern.

This research **skips Next.js basics** and focuses entirely on Payload integration specifics.

---

## Recommended Stack

### Core CMS Layer

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `payload` | `3.77.0` | Core CMS engine | HIGH — verified npm |
| `@payloadcms/next` | `3.77.0` | Next.js adapter: REST API, GraphQL, Admin panel routes | HIGH — verified npm |
| `@payloadcms/db-postgres` | `3.77.0` | PostgreSQL database adapter (uses Drizzle ORM internally) | HIGH — verified npm |
| `@payloadcms/richtext-lexical` | `3.77.0` | Lexical rich text editor (the current default and only actively developed editor) | HIGH — verified npm |
| `sharp` | `0.34.5` | Image resizing for media uploads (Payload requires this explicitly) | HIGH — verified npm |
| `graphql` | `^16.x` | Required peer dep for Payload's GraphQL layer | HIGH — official docs |

> Note: All `@payloadcms/*` packages move in lockstep — they must all be the same minor version. Install with `--legacy-peer-deps` if peer conflicts arise with React 19.

### PostgreSQL Adapter (Supabase)

| Configuration Detail | Value | Notes |
|---------------------|-------|-------|
| Package | `@payloadcms/db-postgres` | Uses Drizzle ORM + node-postgres under the hood |
| Connection string env var | `DATABASE_URI` | Standard Payload convention |
| Supabase connection type | **Transaction pooler** (port 6543) | Recommended for serverless/Next.js environments to avoid connection saturation |
| Migration management | Automatic in dev, explicit CLI in prod | Drizzle generates DDL migrations; run `payload migrate` before deploy |

**Why transaction pooler over direct connection:** Payload runs inside Next.js which can spawn many concurrent requests. Direct connections (port 5432) hit Supabase's per-project connection limits quickly. The transaction pooler (port 6543) is designed for this pattern.

**Configuration pattern:**

```typescript
// payload.config.ts
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
})
```

### Rich Text Editor: Lexical (NOT Slate)

**Decision: Lexical only.**

| Editor | Status | Recommendation |
|--------|--------|---------------|
| `@payloadcms/richtext-lexical` | Active, default | USE THIS |
| `@payloadcms/richtext-slate` | Deprecated, removed in Payload 4.0 | DO NOT USE |

**Why Lexical:**
- It is now the default and only editor receiving development in Payload 3.x
- Slate has been officially deprecated and will be removed in Payload 4.0
- Lexical is built on Meta's framework, offering extensible "features" (custom blocks, inline elements, etc.)
- Lexical ships with `@payloadcms/richtext-lexical` and needs no external dependency

**Lexical feature configuration for a blog:**

```typescript
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  HeadingFeature,
  BlockquoteFeature,
  BoldTextFeature,
  ItalicTextFeature,
  UnderlineTextFeature,
  StrikethroughTextFeature,
  CodeFeature,
  OrderedListFeature,
  UnorderedListFeature,
  LinkFeature,
  InlineCodeTextFeature,
  UploadFeature,
  HorizontalRuleFeature,
} from '@payloadcms/richtext-lexical'

// In your collection's richText field:
editor: lexicalEditor({
  features: [
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BoldTextFeature(),
    ItalicTextFeature(),
    UnderlineTextFeature(),
    StrikethroughTextFeature(),
    CodeFeature(),
    InlineCodeTextFeature(),
    BlockquoteFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    LinkFeature(),
    UploadFeature(),
    HorizontalRuleFeature(),
  ],
})
```

### Official Payload Plugins

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `@payloadcms/plugin-seo` | `3.77.0` | Adds `meta` field group (title, description, OG image) to collections with auto-generate functions | HIGH — verified npm |
| `@payloadcms/plugin-nested-docs` | `3.77.0` | Parent-child hierarchical document structure (knowledge base categories, breadcrumbs) | HIGH — verified npm |
| `@payloadcms/plugin-search` | `3.77.0` | Syncs content to a search collection for fast full-text search | HIGH — verified npm |

**Why `@payloadcms/plugin-seo`:** It adds managed SEO fields inside the Payload admin panel, provides a live preview of how the meta will appear in search results, and exposes `generateTitle`, `generateDescription`, `generateImage`, `generateURL` hook functions. Fields integrate directly with Next.js `generateMetadata`.

**Why `@payloadcms/plugin-nested-docs`:** Knowledge base content is inherently hierarchical (Category > Section > Article). This plugin adds automatic `parent` relationship fields and recursive `breadcrumbs` arrays. Essential for KB navigation and breadcrumb SEO.

**Why `@payloadcms/plugin-search`:** Rather than running full-text queries on the main Postgres tables on every request, the search plugin syncs documents into a flattened search collection. Better performance for site search.

### SEO & Structured Data (Frontend Layer)

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `schema-dts` | `1.1.5` | TypeScript types for Schema.org JSON-LD | HIGH — verified npm |
| Native `app/sitemap.ts` | Built-in | Dynamic XML sitemap generation — no external package needed | HIGH — Next.js 16 official docs |
| Native `generateMetadata` | Built-in | Per-page meta tags, OG tags, canonical URLs | HIGH — Next.js 16 official docs |
| `next/og` (ImageResponse) | Built-in | Dynamic OG image generation via Edge runtime | HIGH — Next.js built-in |

**Why `schema-dts` instead of raw objects:** Provides compile-time TypeScript validation of Schema.org vocabulary. Catches invalid structured data during authoring, zero runtime overhead (types only). Officially recommended by Next.js docs as the standard approach for typed JSON-LD.

**Why NOT `next-sitemap` (version 4.2.3):** Next.js 15+ (and 16) ships native `app/sitemap.ts` support with `generateSitemaps` for large paginated sitemaps. This covers 100% of the use case for a blog/KB without an external package. Payload's own documentation demonstrates this native approach. Reserve `next-sitemap` for the older Pages Router pattern only.

**SEO implementation pattern:**

```typescript
// app/blog/[slug]/page.tsx
import { WithContext, Article } from 'schema-dts'

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug) // Payload local API
  return {
    title: post.meta?.title ?? post.title,
    description: post.meta?.description,
    openGraph: {
      images: [post.meta?.image?.url],
    },
    alternates: { canonical: `/blog/${post.slug}` },
  }
}

export default async function BlogPost({ params }) {
  const post = await getPostBySlug(params.slug)
  const jsonLd: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: { '@type': 'Person', name: post.author.name },
    datePublished: post.publishedAt,
    image: post.meta?.image?.url,
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* page content */}
    </>
  )
}
```

---

## Required Files for Payload Integration

Payload 3 installs directly into the Next.js `/app` directory. These files are one-time setup and **never need to be edited again** after creation.

```
app/
├── (payload)/                    # Route group — isolates Payload routes from your app
│   ├── admin/
│   │   └── [[...segments]]/
│   │       ├── page.tsx          # Payload admin panel page
│   │       └── not-found.tsx     # Admin 404 handler
│   ├── api/
│   │   └── [...slug]/
│   │       └── route.ts          # REST API + GraphQL handler
│   └── layout.tsx                # Minimal layout (no shared providers)
├── (app)/                        # Your existing landing page routes go here
│   ├── layout.tsx                # Your existing root layout
│   └── page.tsx                  # Your existing home page
payload.config.ts                 # Payload configuration (root of repo)
```

**Why route groups matter:** Placing Payload in `(payload)` and your existing app in `(app)` allows both to have their own root layouts. Without this separation, Payload's admin panel conflicts with your existing layout (nav, footer, etc.).

**`next.config.ts` change required:**

```typescript
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  // your existing config
}

export default withPayload(nextConfig)
```

---

## Next.js 16 + Turbopack Compatibility

**Status as of 2026-02-18: RESOLVED in Payload 3.73.0+**

| Version | Status |
|---------|--------|
| Payload < 3.73.0 + Next.js 16 | Broken — `withPayload` unconditionally injected a webpack config, causing Turbopack errors |
| Payload >= 3.73.0 + Next.js >= 16.2.0 | Fully working — Turbopack HMR and production builds both work |

**Requirement:** Must use Payload `3.73.0+` AND Next.js `16.2.0+` (or `>16.1.1-canary.35`). Since the project is on Next.js 16, verify it is 16.2.0 or higher before installing Payload.

Source: [Payload release notes v3.73.0](https://github.com/payloadcms/payload/releases), [GitHub Issue #14354](https://github.com/payloadcms/payload/issues/14354)

---

## Environment Variables Required

```bash
# .env.local
DATABASE_URI=postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true
PAYLOAD_SECRET=your-very-long-random-secret-string-minimum-32-chars
NEXT_PUBLIC_SERVER_URL=https://packbee.com
```

- `DATABASE_URI`: Supabase transaction pooler string (port 6543, append `?pgbouncer=true`)
- `PAYLOAD_SECRET`: Random string, treat as a cryptographic secret — never commit it
- `NEXT_PUBLIC_SERVER_URL`: Used by Payload's SEO plugin `generateURL` and live preview iframe

---

## Complete Install Command

```bash
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/plugin-seo @payloadcms/plugin-nested-docs @payloadcms/plugin-search graphql sharp --legacy-peer-deps

npm install -D schema-dts
```

`--legacy-peer-deps` is currently required because Payload 3.x has peer dependency declarations that may conflict with React 19's peer dep format, even though it works correctly at runtime. This is a known temporary issue and expected to be cleaned up as Payload's ecosystem matures.

---

## Alternatives Considered and Rejected

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Rich Text | Lexical (`@payloadcms/richtext-lexical`) | Slate (`@payloadcms/richtext-slate`) | Slate deprecated in Payload 3, removed in Payload 4. Starting new content with Slate incurs mandatory migration later. |
| Sitemap | Native `app/sitemap.ts` | `next-sitemap` (v4.2.3) | Next.js 15/16 natively supports `sitemap.ts` with `generateSitemaps`. External package adds complexity and a postbuild step for no gain in this context. |
| Structured Data | `schema-dts` (type layer only) | `next-seo` | `next-seo` targets the Pages Router pattern; App Router has native `generateMetadata`. It adds abstraction without benefit here. |
| Structured Data | `schema-dts` + inline `<script>` | JSON-LD package | Next.js official docs explicitly recommend `schema-dts` + `JSON.stringify` with XSS sanitization. No runtime library needed. |
| DB Adapter | `@payloadcms/db-postgres` | `@payloadcms/db-sqlite` | SQLite is for local dev/demos only. PostgreSQL is production-grade and matches the existing Supabase infrastructure. |
| DB Adapter | `@payloadcms/db-postgres` | `@payloadcms/db-mongodb` | MongoDB is a valid choice but PostgreSQL is already available via Supabase and is the project's existing DB platform. Adding a second DB vendor increases operational complexity. |
| Media Storage | Local filesystem (Payload default) | `@payloadcms/storage-uploadthing` or S3 | Local filesystem is sufficient for 2-5 authors and a landing page blog. Switching to cloud storage later is a single adapter swap. Start simple. |

---

## Collection Architecture Recommendation

Based on the official Payload website template and the feature requirements:

```
Collections:
├── posts          # Blog articles (draft-enabled, versioned)
├── kb-articles    # Knowledge base articles (draft-enabled, nested-docs)
├── categories     # Shared taxonomy for both blog and KB
├── authors        # Team member profiles (2-5 people)
└── media          # Images, attachments (upload-enabled)

Globals:
├── blog-settings  # Blog title, description, OG defaults
└── kb-settings    # Knowledge base title, description
```

**Why separate `posts` and `kb-articles`:** Blog posts and knowledge base articles have different access patterns, different SEO schemas (Article vs. TechArticle), and different admin workflows (blog = chronological, KB = hierarchical). Merging them into one collection would require complex conditional logic on the `nested-docs` plugin.

**Why `categories` is shared:** Both blog and KB benefit from the same taxonomy. Categories can be filterable across both content types.

---

## What NOT to Use

| Don't use | Reason |
|-----------|--------|
| `@payloadcms/richtext-slate` | Deprecated, being removed in Payload 4 |
| `next-seo` | Pages Router library, anti-pattern with App Router |
| `next-sitemap` | Unnecessary with native Next.js 15/16 sitemap support |
| Payload's GraphQL API for frontend data fetching | Payload's **Local API** (direct DB access, zero HTTP overhead) is the correct pattern when frontend and CMS run in the same Next.js process. Only use REST/GraphQL for external consumers. |
| `@payloadcms/db-sqlite` in production | SQLite is dev-only, not suitable for production |
| Turbopack with Payload `< 3.73.0` | Will break. Ensure Payload >= 3.73.0 before integrating. |

---

## Confidence Assessment

| Decision | Confidence | Evidence |
|----------|------------|---------|
| Package versions | HIGH | Verified against npm registry directly (npm info) |
| Lexical over Slate | HIGH | Official Payload docs explicitly state Slate deprecated, removed in v4 |
| `@payloadcms/plugin-seo` for meta management | HIGH | Official plugin, documented on payloadcms.com |
| `@payloadcms/plugin-nested-docs` for KB | HIGH | Official plugin, documented on payloadcms.com |
| Native sitemap.ts over next-sitemap | HIGH | Next.js 16 official docs + Payload's own guide uses native approach |
| `schema-dts` for JSON-LD | HIGH | Next.js official docs explicitly recommend it with code example |
| Transaction pooler for Supabase | MEDIUM | Payload + Supabase guide recommends it; Supabase docs confirm it's best for serverless |
| Next.js 16.2.0+ required for Turbopack | HIGH | Payload release notes v3.73.0 explicitly state this requirement |
| Route group separation `(payload)` vs `(app)` | HIGH | Official Payload installation docs describe this as the required pattern for existing apps |
| Local API for data fetching (not REST) | HIGH | Payload official docs describe Local API as the correct pattern when co-located |

---

## Sources

- [Payload 3.x latest release (v3.76.1, February 11, 2026)](https://github.com/payloadcms/payload/releases) — HIGH
- [Payload Installation Docs](https://payloadcms.com/docs/getting-started/installation) — HIGH
- [Payload PostgreSQL Adapter Docs](https://payloadcms.com/docs/database/postgres) — HIGH
- [Payload SEO Plugin Docs](https://payloadcms.com/docs/plugins/seo) — HIGH
- [Payload Nested Docs Plugin Docs](https://payloadcms.com/docs/plugins/nested-docs) — HIGH
- [Payload Rich Text Overview (Lexical deprecation of Slate)](https://payloadcms.com/docs/rich-text/overview) — HIGH
- [Payload + Supabase Setup Guide](https://payloadcms.com/posts/guides/setting-up-payload-with-supabase-for-your-nextjs-app-a-step-by-step-guide) — HIGH
- [Payload Dynamic Sitemap Guide](https://payloadcms.com/posts/guides/how-to-build-an-seo-friendly-sitemap-in-payload--nextjs) — HIGH
- [Next.js JSON-LD Guide (recommends schema-dts)](https://nextjs.org/docs/app/guides/json-ld) — HIGH
- [Next.js generateSitemaps API](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) — HIGH
- [Payload + Next.js 16 Turbopack Compatibility (Issue #14354)](https://github.com/payloadcms/payload/issues/14354) — HIGH
- [Payload v3.73.0 — Next.js 16 Full Compatibility](https://www.buildwithmatija.com/blog/payload-cms-nextjs-16-compatibility-breakthrough) — MEDIUM (third-party, aligns with release notes)
- [Official Payload Website Template (collections reference)](https://github.com/payloadcms/payload/tree/main/templates/website) — HIGH
- npm registry direct queries for version verification — HIGH
