---
phase: 01-infrastructure
plan: 01
subsystem: infra
tags: [payload-cms, next-js, route-groups, tailwind-isolation]

requires:
  - phase: none
    provides: "First plan — no dependencies"
provides:
  - "(marketing) and (payload) route groups with CSS isolation"
  - "Payload CMS 3.77.0 installed with all dependencies"
  - "payload.config.ts with push:false and Users collection"
  - "Admin panel boilerplate at /admin"
affects: [01-02, 02-content-model, 03-frontend-seo]

tech-stack:
  added: [payload@3.77.0, "@payloadcms/next@3.77.0", "@payloadcms/db-postgres@3.77.0", "@payloadcms/richtext-lexical@3.77.0", graphql, sharp]
  patterns: ["dual route groups (marketing)/(payload) for CSS isolation", "withPayload next.config wrapper", "@payload-config tsconfig alias"]

key-files:
  created:
    - app/(marketing)/layout.tsx
    - app/(marketing)/page.tsx
    - app/(payload)/layout.tsx
    - app/(payload)/custom.scss
    - app/(payload)/admin/importMap.js
    - app/(payload)/admin/[[...segments]]/page.tsx
    - app/(payload)/admin/[[...segments]]/not-found.tsx
    - app/(payload)/api/[...slug]/route.ts
    - payload.config.ts
    - src/collections/Users.ts
    - src/migrations/.gitkeep
    - next.config.mjs
  modified:
    - tsconfig.json
    - package.json

key-decisions:
  - "next.config.ts renamed to next.config.mjs for ESM withPayload import"
  - "No root app/layout.tsx — prevents CSS bleed between route groups"
  - "Next.js pinned to resolved version instead of 'latest'"

duration: 8min
completed: 2026-02-18
---

# Phase 1 Plan 01: Route Group Restructure & Payload Install Summary

**Dual route group architecture with Payload CMS 3.77.0 installed, admin boilerplate at /admin, and CSS isolation between Tailwind and Payload admin UI**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-18T21:30:00Z
- **Completed:** 2026-02-18T21:43:00Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments
- Existing landing page moved to `(marketing)` route group without breaking any imports or animations
- Payload CMS 3.77.0 installed with all dependencies pinned to matching versions
- `(payload)` route group created with full admin panel and REST API boilerplate
- `payload.config.ts` at project root with `push: false` and `migrationDir: './src/migrations'` from day one
- CSS isolation confirmed: no Tailwind bleed into Payload admin UI

## Task Commits

1. **Task 1: Route group restructure and Payload 3.77.0 install** - `13ef120` (feat)
2. **Task 2: Payload config, Users collection, and (payload) route group** - `1d89e25` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `app/(marketing)/layout.tsx` - Landing page layout (moved from app/layout.tsx)
- `app/(marketing)/page.tsx` - Landing page entry (moved from app/page.tsx)
- `app/(payload)/layout.tsx` - Payload admin layout with RootLayout
- `app/(payload)/admin/[[...segments]]/page.tsx` - Admin page renderer
- `app/(payload)/admin/[[...segments]]/not-found.tsx` - Admin 404 handler
- `app/(payload)/api/[...slug]/route.ts` - REST API routes
- `app/(payload)/custom.scss` - Admin CSS customization hook (empty)
- `app/(payload)/admin/importMap.js` - Component import map
- `payload.config.ts` - Payload configuration with push:false
- `src/collections/Users.ts` - Users collection with auth:true
- `src/migrations/.gitkeep` - Migration directory placeholder
- `next.config.mjs` - Next.js config with withPayload wrapper
- `tsconfig.json` - Added @payload-config path alias
- `package.json` - Pinned Next.js version, added Payload dependencies

## Decisions Made
- Renamed `next.config.ts` to `next.config.mjs` (ESM required for withPayload import)
- No root `app/layout.tsx` created — CSS isolation relies on separate layouts per route group
- Next.js version pinned to resolved version rather than keeping `"latest"`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed not-found.tsx missing required props**
- **Found during:** Task 2 (Payload boilerplate creation)
- **Issue:** Boilerplate `not-found.tsx` from plan was missing `params` and `searchParams` props required by `NotFoundPage` in `@payloadcms/next@3.77.0`
- **Fix:** Added required props to match the component's type signature
- **Verification:** `npm run build` passes without errors
- **Committed in:** 1d89e25

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type signature update. No scope creep.

## Issues Encountered
None — plan executed as written with one minor type fix.

## Next Phase Readiness
- Route group architecture established, ready for Supabase connection
- `payload.config.ts` ready for Media collection addition in Plan 01-02
- `push: false` set from day one as required

---
*Phase: 01-infrastructure*
*Completed: 2026-02-18*
