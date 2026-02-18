# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Drive organic traffic to PackBee through SEO-optimized blog content and provide a self-serve knowledge base for customers and prospects.
**Current focus:** Phase 3 complete — all pages, sitemap, robots.txt, and KB routes delivered

## Current Position

Phase: 3 of 3 (Frontend & SEO) — Complete
Plan: 3 of 3 in current phase
Status: Phase complete
Last activity: 2026-02-18 — Completed 03-03 (KB listing page, KB article/section page with disambiguation + FAQPage JSON-LD)

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 8 min
- Total execution time: 58 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 2/2 | 33 min | 17 min |
| 2 | 2/2 | 18 min | 9 min |
| 3 | 3/3 | 7 min | 2 min |

**Recent Trend:**
- Last 5 plans: 02-02 (4 min), 03-01 (4 min), 03-02 (1 min), 03-03 (2 min)
- Trend: Fast and consistent

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-phase]: Route group restructure (`(marketing)`) must happen BEFORE Payload install — CSS bleed is irreversible after install
- [Pre-phase]: `push: false` and `migrationDir: './src/migrations'` must be set in the very first Payload commit — never use push mode against the Supabase project
- [Pre-phase]: All `@payloadcms/*` packages must be pinned at `3.77.0` — mixed versions cause runtime errors
- [Pre-phase]: Supabase connection must use transaction pooler (port 6543) with `?pgbouncer=true` — not session pooler
- [01-01]: next.config.ts renamed to next.config.mjs for ESM withPayload import
- [01-01]: No root app/layout.tsx — CSS isolation via separate route group layouts
- [01-02]: Added `"type": "module"` to package.json for Payload CLI ESM compatibility with Node.js 22
- [02-01]: `slugField()` returns a single RowField object — use as single field element, NOT spread with `...`
- [02-01]: `seoPlugin({ fields })` requires FieldsOverride function `({ defaultFields }) => Field[]` — NOT a plain array
- [02-02]: KnowledgeBase omits schedulePublish — KB articles not time-sensitive per requirements
- [02-02]: Section grouping via relationship to sections collection — enables /help/[section-slug] routes
- [03-01]: `revalidateTag(tag, profile)` and `revalidatePath(path, type)` in Next.js 16.1.6 require a second argument — use `'everything'` for profile and `'page'` for type
- [03-01]: steps[] and faqs[] added as structured array fields (not derived from Lexical body) for clean HowTo/FAQPage JSON-LD generation
- [03-01]: Use `npx payload` directly — no `payload` script in package.json
- [03-02]: `React.cache()` wraps `queryPostBySlug` to deduplicate Payload queries between generateMetadata and page render
- [03-02]: `app/sitemap.ts` must be at app root (not inside route group) to serve correctly at /sitemap.xml
- [03-02]: Import path for cache-tags from app/sitemap.ts is `../src/lib/cache-tags` (app/ is sibling to src/)
- [03-03]: DB disambiguation for /help/[slug] — section lookup runs first; section slugs take priority over article slugs
- [03-03]: Search type from payload-types.ts has no `slug` field — slug is at `result.doc.value.slug` (on the populated KnowledgeBase document)
- [03-03]: `overrideAccess: false` required on all KB article queries — public visitors must not see draft articles

### Pending Todos

None.

### Blockers/Concerns

- `NEXT_PUBLIC_SERVER_URL` env var needed for live preview URLs in Posts and KnowledgeBase collections (set before deploying to production)
- Design pass is deferred — all pages use minimal Tailwind for structure only

## Session Continuity

Last session: 2026-02-18
Stopped at: Completed 03-03-PLAN.md — KB listing page, KB article/section page, all phase 3 plans complete
Resume file: None
