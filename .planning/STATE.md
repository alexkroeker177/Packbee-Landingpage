# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Drive organic traffic to PackBee through SEO-optimized blog content and provide a self-serve knowledge base for customers and prospects.
**Current focus:** Phase 3 in progress — blog pages and sitemap complete, ready for KB/help pages

## Current Position

Phase: 3 of 3 (Frontend & SEO) — In progress
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-18 — Completed 03-02 (blog listing, blog post, sitemap, robots.txt)

Progress: [█████████░] 90%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 9 min
- Total execution time: 56 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 2/2 | 33 min | 17 min |
| 2 | 2/2 | 18 min | 9 min |
| 3 | 2/3 | 5 min | 3 min |

**Recent Trend:**
- Last 5 plans: 02-01 (14 min), 02-02 (4 min), 03-01 (4 min), 03-02 (1 min)
- Trend: Accelerating

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

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3: `convertLexicalToHTML()` import path for Payload 3.73+ should be verified at implementation time (marked MEDIUM confidence in research) — use `/html` path: `import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'`
- Phase 3: `NEXT_PUBLIC_SERVER_URL` env var needed for live preview URLs in Posts and KnowledgeBase collections

## Session Continuity

Last session: 2026-02-18
Stopped at: Completed 03-02-PLAN.md — blog listing, blog post, sitemap, robots.txt
Resume file: None
