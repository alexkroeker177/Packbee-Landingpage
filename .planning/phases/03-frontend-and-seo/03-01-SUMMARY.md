---
phase: 03-frontend-and-seo
plan: 01
subsystem: database
tags: [payload, postgres, migration, search-plugin, revalidation, next-cache, json-ld, structured-data]

# Dependency graph
requires:
  - phase: 02-content-model
    provides: Posts and KnowledgeBase collections with slugField, seoPlugin, drafts, and versions

provides:
  - contentType select field on Posts (article/tutorial) for conditional Article/HowTo JSON-LD
  - steps[] array field on Posts (conditional on contentType=tutorial) for HowTo structured data
  - excerpt textarea on KnowledgeBase for search plugin sync and meta fallback
  - articleType select field on KnowledgeBase (standard/faq) for conditional Article/FAQPage JSON-LD
  - faqs[] array field on KnowledgeBase (conditional on articleType=faq) for FAQPage structured data
  - @payloadcms/plugin-search registered targeting knowledge-base collection with excerpt and section sync
  - revalidatePost afterChange hook for on-demand ISR of /blog/[slug] and posts-sitemap tag
  - revalidateKB afterChange hook for on-demand ISR of /help/[slug], /help, and kb-sitemap tag
  - CACHE_TAGS constants for shared sitemap tag names between hooks and future sitemap.ts

affects:
  - 03-02: Blog pages can use post.contentType and post.steps[] for JSON-LD schemas
  - 03-03: KB pages can use article.articleType and article.faqs[] for FAQPage JSON-LD and search collection for KB-05
  - future sitemap.ts must use CACHE_TAGS.POSTS_SITEMAP and CACHE_TAGS.KB_SITEMAP for tag-based revalidation

# Tech tracking
tech-stack:
  added:
    - "@payloadcms/plugin-search@3.77.0"
  patterns:
    - "afterChange hooks call revalidatePath + revalidateTag directly from next/cache (same-process, no webhook needed)"
    - "Shared CACHE_TAGS constants prevent tag name drift between hooks and sitemap cache"
    - "Conditional admin.condition function hides array fields unless parent select matches (contentType=tutorial, articleType=faq)"
    - "searchPlugin beforeSync copies excerpt and section fields from originalDoc into search index doc"

key-files:
  created:
    - src/lib/cache-tags.ts
    - src/collections/hooks/revalidatePost.ts
    - src/collections/hooks/revalidateKB.ts
    - src/migrations/20260218_231743.ts
    - src/migrations/20260218_231743.json
  modified:
    - src/collections/Posts.ts
    - src/collections/KnowledgeBase.ts
    - payload.config.ts
    - payload-types.ts
    - package.json
    - package-lock.json

key-decisions:
  - "revalidateTag in Next.js 16.1.6 requires a second argument (profile: string | CacheLifeConfig) — use 'everything' as the profile string"
  - "revalidatePath also requires type as second arg ('page' | 'layout') in this Next.js version"
  - "steps[] added as structured field on Posts (not derived from Lexical headings) — editor-controlled, clean HowTo schema source"
  - "faqs[] added as structured field on KnowledgeBase (not parsed from body) — structured fields give reliable FAQPage mainEntity"
  - "excerpt added to KnowledgeBase before articleType — needed for searchPlugin beforeSync and seoPlugin generateDescription"

patterns-established:
  - "Hook pattern: CollectionAfterChangeHook<Type> checks context.disableRevalidate, calls revalidatePath(path, 'page') + revalidateTag(tag, 'everything')"
  - "Unpublish handling: check previousDoc?._status === 'published' && doc._status !== 'published'"

# Metrics
duration: 4min
completed: 2026-02-18
---

# Phase 3 Plan 01: Schema Updates Summary

**Structured data fields (contentType, articleType, steps[], faqs[]), @payloadcms/plugin-search for KB search, and afterChange revalidation hooks with shared cache tag constants — all migrated and type-generated for Next.js 16 on-demand ISR**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-18T23:16:29Z
- **Completed:** 2026-02-18T23:20:16Z
- **Tasks:** 2/2
- **Files modified:** 10

## Accomplishments

- Installed and configured @payloadcms/plugin-search@3.77.0 targeting knowledge-base with excerpt and section field sync
- Added contentType select + steps[] array to Posts and articleType select + faqs[] array + excerpt to KnowledgeBase; ran migration 20260218_231743 cleanly
- Created afterChange hooks (revalidatePost, revalidateKB) with shared CACHE_TAGS constants for on-demand ISR of blog and help pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Add structured data fields + install search plugin + run migration** - `a05e086` (feat)
2. **Task 2: Create revalidation hooks + cache tag constants + register on collections** - `c138b99` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/lib/cache-tags.ts` - Shared CACHE_TAGS constants (POSTS_SITEMAP, KB_SITEMAP) for hooks and future sitemap.ts
- `src/collections/hooks/revalidatePost.ts` - afterChange hook: revalidates /blog/[slug] and posts-sitemap tag on publish/unpublish
- `src/collections/hooks/revalidateKB.ts` - afterChange hook: revalidates /help/[slug], /help, and kb-sitemap tag on publish/unpublish
- `src/collections/Posts.ts` - Added contentType select, steps[] array (conditional), revalidatePost hook registration
- `src/collections/KnowledgeBase.ts` - Added excerpt textarea, articleType select, faqs[] array (conditional), revalidateKB hook registration
- `payload.config.ts` - Added searchPlugin import and registration in plugins array after seoPlugin
- `payload-types.ts` - Regenerated with contentType, articleType, steps, faqs, excerpt types
- `src/migrations/20260218_231743.ts` - Migration adding all new columns and search table
- `package.json` / `package-lock.json` - @payloadcms/plugin-search@3.77.0 added

## Decisions Made

- **revalidateTag requires 2 args in Next.js 16.1.6:** The type signature is `revalidateTag(tag: string, profile: string | CacheLifeConfig)` — not optional as in older versions. Used `'everything'` as the profile string. Same for `revalidatePath` which requires `type: 'layout' | 'page'` as second arg.
- **steps[] as structured field:** Added a `steps[]` array with title + description sub-fields to Posts (not auto-derived from Lexical headings). This gives editors explicit control and produces clean HowTo `step` arrays for JSON-LD.
- **faqs[] as structured field:** Added a `faqs[]` array with question + answer sub-fields to KnowledgeBase. Free-form Lexical body cannot reliably generate FAQPage mainEntity pairs.
- **excerpt on KnowledgeBase:** KnowledgeBase previously had no excerpt field. Added before articleType to support searchPlugin beforeSync and to be picked up by seoPlugin's generateDescription function.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed revalidatePath and revalidateTag call signatures for Next.js 16**

- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** Plan's hook code called `revalidatePath(path)` and `revalidateTag(tag)` with single arguments; Next.js 16.1.6 requires a second argument for both functions (`type: 'layout' | 'page'` for revalidatePath, `profile: string | CacheLifeConfig` for revalidateTag). TypeScript errors: "Expected 2 arguments, but got 1."
- **Fix:** Added `'page'` as type arg to all `revalidatePath()` calls; added `'everything'` as profile arg to all `revalidateTag()` calls
- **Files modified:** src/collections/hooks/revalidatePost.ts, src/collections/hooks/revalidateKB.ts
- **Verification:** `npx tsc --noEmit` exits with no errors
- **Committed in:** c138b99 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed plugins array syntax in payload.config.ts**

- **Found during:** Task 1 (after adding searchPlugin using Edit tool)
- **Issue:** Edit tool inserted `searchPlugin(...)` block AFTER the closing `],` of the plugins array, resulting in invalid JavaScript with a dangling block outside the array
- **Fix:** Rewrote payload.config.ts with Write tool to place searchPlugin correctly inside the plugins array
- **Files modified:** payload.config.ts
- **Verification:** `grep 'searchPlugin' payload.config.ts` shows import and call inside plugins array; `npx tsc --noEmit` passes
- **Committed in:** a05e086 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 - Bug)
**Impact on plan:** Both fixes required for correctness. No scope creep.

## Issues Encountered

- `npm run payload migrate:create` fails because there is no `payload` script in package.json — used `npx payload` directly instead. This is consistent with how prior migrations were run in Phase 2.

## User Setup Required

None - no external service configuration required. Migration ran against the existing configured database.

## Next Phase Readiness

- All fields are migrated and typed: post.contentType, post.steps[], article.articleType, article.faqs[], article.excerpt are available in payload-types.ts
- afterChange hooks are wired and will fire automatically on CMS publish/unpublish
- searchPlugin creates and syncs the `search` collection; ready for KB-05 search UI in 03-03
- CACHE_TAGS constants are ready for sitemap.ts tag-based revalidation in 03-02 or 03-03
- No blockers for Phase 3 page implementation plans (03-02, 03-03)

---
*Phase: 03-frontend-and-seo*
*Completed: 2026-02-18*
