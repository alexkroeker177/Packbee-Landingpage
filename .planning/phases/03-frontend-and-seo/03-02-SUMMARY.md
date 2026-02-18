---
phase: "03"
plan: "02"
subsystem: frontend-seo
tags: [next.js, payload-cms, blog, seo, json-ld, sitemap, robots, richtext-lexical]
requires: ["03-01"]
provides: ["blog-listing-page", "blog-post-page", "sitemap", "robots-txt"]
affects: ["03-03"]
tech-stack:
  added: []
  patterns: ["server-component-data-fetching", "react-cache-deduplication", "structured-data-json-ld", "unstable_cache-tag-revalidation"]
key-files:
  created:
    - app/(marketing)/blog/page.tsx
    - app/(marketing)/blog/[slug]/page.tsx
    - app/sitemap.ts
    - app/robots.ts
  modified: []
key-decisions:
  - "Blog post page uses React.cache() to deduplicate Payload queries between generateMetadata and page component"
  - "Article JSON-LD for article contentType, HowTo JSON-LD for tutorial contentType using post.steps[]"
  - "sitemap.ts at app root (not inside route group) to correctly serve at /sitemap.xml"
  - "Import path ../src/lib/cache-tags used from app/sitemap.ts since app/ sits next to src/"
  - "generateStaticParams fetches all published slugs for build-time static generation"
duration: "1 min"
completed: "2026-02-18"
---

# Phase 03 Plan 02: Blog Pages Summary

**One-liner:** Blog listing with pagination, post detail with lexical RichText + author bio + Article/HowTo JSON-LD, XML sitemap with tag-based revalidation, and robots.txt blocking /admin.

## What Was Built

Four Server Components implementing the public-facing blog experience and SEO infrastructure:

1. **`app/(marketing)/blog/page.tsx`** — Blog listing page querying published posts via Payload Local API with `overrideAccess: false`, pagination controls (previous/next), author name, excerpt, featured image, and formatted publish date.

2. **`app/(marketing)/blog/[slug]/page.tsx`** — Individual blog post page with `RichText` from `@payloadcms/richtext-lexical/react`, author bio section (avatar, role, bio), Article JSON-LD for standard posts, HowTo JSON-LD for tutorial posts using `post.steps[]`, `generateMetadata` with full SEO fields (title, description, robots, canonical, OG), and `generateStaticParams` for static generation.

3. **`app/sitemap.ts`** — XML sitemap using `unstable_cache` with tag-based revalidation via `CACHE_TAGS.POSTS_SITEMAP` and `CACHE_TAGS.KB_SITEMAP`. Includes static pages (/, /blog, /help) plus all published non-noIndex posts and KB articles queried in parallel.

4. **`app/robots.ts`** — robots.txt blocking `/admin` from all user agents, with link to `/sitemap.xml`.

## Decisions Made

| Decision | Rationale |
|---|---|
| `React.cache()` wraps `queryPostBySlug` | Deduplicates DB query shared between `generateMetadata` and page render without extra network round-trip |
| JSON-LD branching on `post.contentType` | Clean separation of Article vs HowTo schema; steps[] used directly rather than parsing Lexical body |
| `sitemap.ts` at `app/` root | Next.js requires sitemap at app root level to serve at `/sitemap.xml`; placing inside route group would break URL |
| `../src/lib/cache-tags` import | `app/` is a sibling directory to `src/`, so relative path traverses up one level |
| `overrideAccess: false` everywhere | Belt-and-suspenders draft filtering alongside `_status: published` where clause |

## Tasks Completed

| Task | Name | Commit | Key Files |
|---|---|---|---|
| 1 | Blog listing page with pagination | aad58d4 | app/(marketing)/blog/page.tsx |
| 2 | Blog post page with rich text, author bio, JSON-LD | abd2abb | app/(marketing)/blog/[slug]/page.tsx |
| 3 | Sitemap and robots.txt | be07502 | app/sitemap.ts, app/robots.ts |

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `app/(marketing)/blog/page.tsx` exists, fetches posts with `overrideAccess: false`, has pagination controls
- `app/(marketing)/blog/[slug]/page.tsx` has RichText import, `application/ld+json`, HowTo schema, author bio, generateMetadata, generateStaticParams
- `app/sitemap.ts` exists at app root, imports CACHE_TAGS
- `app/robots.ts` blocks /admin, links to sitemap.xml
- `npx tsc --noEmit` exits with zero errors

## Next Phase Readiness

Phase 03-03 (Help/KB pages) can proceed immediately. The patterns established here (Server Component + Payload Local API, `React.cache()` deduplication, JSON-LD branching) apply directly to the KB article pages.

No blockers identified.
