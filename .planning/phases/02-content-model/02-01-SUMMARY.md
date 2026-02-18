---
phase: 02-content-model
plan: 01
subsystem: database
tags: [payload, cms, collections, seo, postgres, blog, editorial-workflow, drafts, versions]

# Dependency graph
requires:
  - phase: 01-infrastructure
    provides: Payload CMS installed with postgres adapter, media collection, migrations dir configured
provides:
  - Authors collection (name, role, bio, avatar fields)
  - Categories collection (title + auto-slug)
  - Sections collection (title + auto-slug + description, for KB section pages)
  - Posts collection (full editorial workflow: drafts, versions, autosave, schedulePublish, live preview)
  - SEO plugin configured with tabbedUI and canonicalURL/ogTitle/noIndex custom fields
  - Jobs queue autoRun for scheduled publish processing
  - Database tables for all new collections (migration 20260218_222700)
affects:
  - 02-02 (KB knowledge-base collection uses same patterns)
  - 03 (frontend blog routes /blog/[slug] need Posts collection types)
  - 03 (frontend KB routes /help/[section]/[slug] need Sections collection types)

# Tech tracking
tech-stack:
  added: ["@payloadcms/plugin-seo@3.77.0"]
  patterns:
    - "slugField() returns a RowField — use as single element in fields array, not spread"
    - "seoPlugin fields is FieldsOverride function ({ defaultFields }) => [...defaultFields, ...customFields]"
    - "Posts access.read returns published filter for unauthenticated, true for authenticated"
    - "readVersions access restricted to authenticated users"
    - "jobs.autoRun with cron '* * * * *' for scheduled publish processing"

key-files:
  created:
    - src/collections/Authors.ts
    - src/collections/Categories.ts
    - src/collections/Sections.ts
    - src/collections/Posts.ts
    - src/migrations/20260218_222700.ts
    - src/migrations/20260218_222700.json
  modified:
    - payload.config.ts
    - src/migrations/index.ts
    - payload-types.ts
    - package.json
    - package-lock.json

key-decisions:
  - "slugField() must be used as a single field element, not spread — it returns a RowField object, not an array"
  - "seoPlugin fields option is a FieldsOverride function that receives defaultFields and must return Field[] — not a plain array"
  - "knowledge-base slug pre-configured in seoPlugin.collections for Phase 02-02 readiness (plugin safely skips missing collections)"
  - "noIndex, canonicalURL, ogTitle added as custom SEO fields via FieldsOverride function extending defaultFields"

patterns-established:
  - "All @payloadcms/* packages pinned at 3.77.0 (no caret prefix)"
  - "Collections follow access pattern: read public, write authenticated"
  - "Draft-enabled collections use schedulePublish: true + autosave for full editorial workflow"

# Metrics
duration: 14min
completed: 2026-02-18
---

# Phase 2 Plan 01: Blog Content Model Summary

**Payload CMS blog content model with Authors/Categories/Sections/Posts collections, full editorial workflow (drafts, versions, autosave, scheduled publishing, live preview), SEO plugin with canonical URL/OG title/noIndex fields, and jobs queue for scheduled publish processing**

## Performance

- **Duration:** 14 min
- **Started:** 2026-02-18T22:24:20Z
- **Completed:** 2026-02-18T22:38:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Four new collections registered in Payload: Authors, Categories, Sections, Posts
- Posts collection has full editorial workflow: drafts, version history (50/doc), autosave (100ms interval), schedulePublish, live preview
- SEO plugin installed at 3.77.0 with tabbedUI, targeting posts and knowledge-base collections; custom fields: canonicalURL, ogTitle, noIndex
- Jobs queue configured with autoRun (every minute) for scheduled publish processing
- Database migration created and applied successfully (migration 20260218_222700)
- TypeScript types regenerated, build passes without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install SEO plugin and create Authors, Categories, Sections** - `47f81a5` (feat)
2. **Task 2: Create Posts collection, update payload.config, run migration** - `4796f64` (feat)

## Files Created/Modified

- `src/collections/Authors.ts` - Author profiles with name, role, bio, avatar (upload to media)
- `src/collections/Categories.ts` - Blog categories with title and auto-generated slug
- `src/collections/Sections.ts` - KB section grouping with title, auto-slug, description
- `src/collections/Posts.ts` - Blog posts with full editorial workflow, SEO, live preview
- `payload.config.ts` - All 6 collections registered, seoPlugin configured, jobs.autoRun added
- `src/migrations/20260218_222700.ts` - DB migration for all new collection tables
- `src/migrations/20260218_222700.json` - Migration snapshot
- `src/migrations/index.ts` - Updated to include new migration (auto-updated by Payload CLI)
- `payload-types.ts` - Regenerated with all new collection types
- `package.json` - Added @payloadcms/plugin-seo@3.77.0 (pinned, no caret)
- `package-lock.json` - Updated lock file

## Decisions Made

- `slugField()` returns a single `RowField` object (not an array) — used as a single element in `fields` array, not spread with `...`
- `seoPlugin({ fields })` expects a `FieldsOverride` function `({ defaultFields }) => Field[]` — not a plain array of fields
- `knowledge-base` pre-included in `seoPlugin.collections` so Phase 02-02 KB collection gets SEO automatically (plugin skips non-existent collections safely)
- Custom SEO fields (canonicalURL, ogTitle, noIndex) added via `FieldsOverride` that extends `defaultFields` so default meta title/description/image fields are preserved

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed slugField() spread pattern**
- **Found during:** Task 1 and Task 2 (collection creation)
- **Issue:** Plan specified `...slugField()` (spread) but `slugField()` returns a plain object (`RowField`), not an iterable array. Spreading an object into an array throws `TypeError: obj is not iterable` at runtime.
- **Fix:** Changed all collection files to use `slugField()` as a single field element (no spread)
- **Files modified:** src/collections/Categories.ts, src/collections/Sections.ts, src/collections/Posts.ts
- **Verification:** TypeScript check and build pass; slugField correctly registers as RowField containing generateSlug checkbox + slug text field
- **Committed in:** 4796f64 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed seoPlugin fields as FieldsOverride function**
- **Found during:** Task 2 (payload.config.ts update)
- **Issue:** Plan specified `fields: [array]` in seoPlugin config, but the `FieldsOverride` type requires a function `({ defaultFields }) => Field[]`. Passing a plain array caused TS2322 type error.
- **Fix:** Changed `fields` to a function `({ defaultFields }) => [...defaultFields, ...customFields]` so default SEO fields are preserved and custom fields are appended
- **Files modified:** payload.config.ts
- **Verification:** `npx tsc --noEmit` passes with zero errors; `npm run build` succeeds
- **Committed in:** 4796f64 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes required for TypeScript correctness and runtime correctness. No scope creep — all plan-specified functionality was delivered.

## Issues Encountered

None beyond the deviations documented above. Migration ran cleanly on first attempt, build succeeded without additional fixes.

## User Setup Required

None - no external service configuration required beyond what was already set up in Phase 1.

## Next Phase Readiness

- Plan 02-02 (Knowledge Base collection) can now proceed — Posts pattern established, seoPlugin already pre-configured for `knowledge-base`
- Blog routes (Phase 3) will need `NEXT_PUBLIC_SERVER_URL` env var set for live preview URLs to resolve correctly
- Live preview shows 404 until Phase 3 `/blog/[slug]` routes are created — expected and noted in plan

---
*Phase: 02-content-model*
*Completed: 2026-02-18*
