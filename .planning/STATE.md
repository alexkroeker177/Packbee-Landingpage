# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Drive organic traffic to PackBee through SEO-optimized blog content and provide a self-serve knowledge base for customers and prospects.
**Current focus:** Phase 4 complete — Design & Styling for all blog and KB pages done

## Current Position

Phase: 4 of 4 (Design & Styling) — Phase complete
Plan: 3 of 3 in current phase
Status: Complete
Last activity: 2026-02-19 — Completed 04-03-PLAN.md (help pages restyling)

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 7 min
- Total execution time: 67 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 2/2 | 33 min | 17 min |
| 2 | 2/2 | 18 min | 9 min |
| 3 | 3/3 | 7 min | 2 min |
| 4 | 3/3 | 9 min | 3 min |

**Recent Trend:**
- Last 5 plans: 03-02 (1 min), 03-03 (2 min), 04-01 (3 min), 04-02 (3 min), 04-03 (3 min)
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
- [04-01]: `npm install --legacy-peer-deps` required for new packages — Payload CMS 3.77.0 strict peer dep conflict with next@16.1.6
- [04-01]: `@utility prose-amber` with all 16 `--tw-prose-*` vars mapped to brand tokens — apply as `prose prose-amber` on rich text containers
- [04-01]: `BlogPageChrome` is a server component — client boundary handled by Navbar/Footer internally
- [04-02]: Blog post uses max-w-2xl (not max-w-4xl) — narrower column improves long-form reading comfort
- [04-02]: Featured image above title on post pages — establishes visual context before reading headline
- [04-02]: Author bio uses card style (rounded-2xl border bg-section-d) not plain border-t divider
- [04-02]: Cross-navigation tab strip on listing page links Blog + Help Center with active border-b-2 indicator
- [04-03]: BlogPageChrome wraps at HelpPage dispatcher level — SectionLanding and ArticlePage remain pure layout fragments
- [04-03]: Hero search bar extracted as JSX variable (SearchHero/TabStrip) shared across both return paths — avoids duplication without new component files
- [04-03]: Section cards in browse mode show article count with ChevronRight — directory-style navigation, no inline article expansion

### Pending Todos

None.

### Blockers/Concerns

- `NEXT_PUBLIC_SERVER_URL` env var needed for live preview URLs in Posts and KnowledgeBase collections (set before deploying to production)
- All phases and plans complete — project ready for deployment

### Roadmap Evolution

- Phase 4 added: Design & Styling — style blog and KB pages to match PackBee brand

## Session Continuity

Last session: 2026-02-19T19:43:09Z
Stopped at: Completed 04-03-PLAN.md — help pages restyling (all phases complete)
Resume file: None
