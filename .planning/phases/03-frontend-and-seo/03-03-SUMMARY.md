---
phase: 03-frontend-and-seo
plan: "03"
subsystem: ui
tags: [nextjs, payload, richtext-lexical, seo, faq, json-ld, server-component, knowledge-base]

# Dependency graph
requires:
  - phase: 03-01
    provides: KnowledgeBase collection with faqs[], articleType, excerpt fields + search plugin
  - phase: 02-02
    provides: KnowledgeBase and Sections collections registered in Payload config

provides:
  - /help listing page (browse by section + search via plugin-search collection)
  - /help/[slug] combined section landing + article page with DB disambiguation
  - Breadcrumb navigation on all KB pages
  - FAQPage JSON-LD structured data for faq-type articles
  - generateStaticParams for all KB routes
  - generateMetadata for SEO on all KB pages

affects:
  - sitemap (03-02 generates kb-sitemap revalidated by 03-01 hooks)
  - future: KB article UI design passes

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DB disambiguation: try section slug first, then article slug, in single dynamic route"
    - "React.cache() wraps data fetching so generateMetadata and page component share one request"
    - "Native HTML GET form for server-side search (no client JS required)"
    - "FAQPage JSON-LD emitted conditionally based on articleType === 'faq' and faqs.length > 0"

key-files:
  created:
    - "app/(marketing)/help/page.tsx"
    - "app/(marketing)/help/[slug]/page.tsx"
  modified: []

key-decisions:
  - "Single /help/[slug] dynamic route handles both section landing pages and article pages via DB disambiguation (section first priority)"
  - "Search results use result.doc.value.slug (not result.slug — Search type has no slug field)"
  - "overrideAccess: false on all KB article queries to prevent draft leakage to public"

patterns-established:
  - "Pattern: DB disambiguation — try section first, then article. Section slugs take priority."
  - "Pattern: React.cache() shared data fetching between generateMetadata and page component"

# Metrics
duration: 2min
completed: 2026-02-18
---

# Phase 3 Plan 03: KB Pages Summary

**Public /help knowledge base with section-grouped browse, plugin-search filtering, DB-disambiguated /help/[slug] route, breadcrumb navigation, and FAQPage JSON-LD for faq-type articles**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-18T23:25:54Z
- **Completed:** 2026-02-18T23:28:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `/help` listing page: browse mode groups published articles by section (fetches sections + articles per section, skips empty sections); search mode queries the plugin-search `search` collection for filtered results. Native HTML GET form — no client JS needed.
- `/help/[slug]` combined route: DB disambiguation (section lookup first, then article lookup). Sections get a landing page with breadcrumbs and article list. Articles get breadcrumb nav (Home > Help > Section > Article), RichText body, and FAQPage JSON-LD when `articleType === 'faq'` and `faqs.length > 0`.
- `generateStaticParams` pre-renders all section slugs + published KB article slugs at build time.
- `generateMetadata` with full SEO fields (title, description, canonical, robots, openGraph) for both section and article views.
- `notFound()` returned for slugs matching neither section nor article.

## Task Commits

1. **Task 1: KB listing page with section grouping and search** - `c7a7d97` (feat)
2. **Fix: Correct slug resolution for search results** - `d832bc5` (fix — Rule 1 Bug)
3. **Task 2: KB article/section page with disambiguation, breadcrumbs, FAQPage JSON-LD** - `fef2898` (feat)

## Files Created/Modified

- `app/(marketing)/help/page.tsx` — KB listing page (browse + search modes, server component)
- `app/(marketing)/help/[slug]/page.tsx` — Combined section landing + article page (DB disambiguation, breadcrumbs, FAQPage JSON-LD, RichText, generateMetadata, generateStaticParams)

## Decisions Made

- Section lookup takes priority in DB disambiguation — prevents a KB article with the same slug as a section from shadowing the section landing page.
- `overrideAccess: false` on all KB article queries — public visitors must not see draft articles. Section queries use default access (sections are always public per their collection config).
- Search results link uses `result.doc.value.slug` (populated KnowledgeBase slug) because the `Search` type from payload-types.ts does not include a `slug` field directly on the search document.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed invalid `.slug` access on Search type in help listing page**

- **Found during:** TypeScript check after Task 1 commit (`npx tsc --noEmit`)
- **Issue:** Plan instructed `result.slug ?? result.doc?.slug` — but `Search` interface has no `slug` field; slug lives at `result.doc.value.slug` (on the populated `KnowledgeBase` document)
- **Fix:** Changed to resolve slug via `result.doc.value` type assertion: `(result.doc.value as { slug?: string }).slug`
- **Files modified:** `app/(marketing)/help/page.tsx`
- **Verification:** `npx tsc --noEmit` returns no errors
- **Committed in:** `d832bc5` (separate fix commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 Bug)
**Impact on plan:** Fix was essential for TypeScript correctness. No scope creep — slug access logic changed to match actual generated types.

## Issues Encountered

- `Search` type generated by payload-types.ts does not expose a `slug` field — the slug is on the populated relation `doc.value`. The plan's pseudocode used `result.slug` which TypeScript rejected. Fixed by reading from `doc.value` directly.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All KB public routes are complete: /help (list), /help/[section-slug] (landing), /help/[article-slug] (article)
- Phase 03 has three plans; this is plan 03-03 (last plan). Phase 03 is complete.
- Content can now be authored in Payload admin and will appear at /help routes immediately after revalidation.
- Design pass is deferred — pages use minimal Tailwind for structure only.

---
*Phase: 03-frontend-and-seo*
*Completed: 2026-02-18*
