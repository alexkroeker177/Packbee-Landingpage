# Project Research Summary

**Project:** PackBee Landing Page — Blog & Knowledge Base (Payload CMS integration)
**Domain:** SEO-focused SaaS content hub (blog + knowledge base) embedded in an existing Next.js landing page
**Researched:** 2026-02-18
**Confidence:** HIGH

## Executive Summary

This milestone adds a Payload CMS 3.x-powered blog and knowledge base to the existing PackBee Next.js 16 landing page. The recommended approach is to embed Payload directly inside the Next.js app (the native Payload 3.x pattern) rather than running it as a separate service. This means a single deployment unit, zero HTTP overhead for frontend data fetching via Payload's Local API, and a self-contained admin panel at `/admin`. The CMS connects to a dedicated Supabase PostgreSQL project (separate from the product DB) using the transaction pooler connection string (port 6543) to avoid connection exhaustion under Next.js's concurrent request model.

The content model is two-track: a `posts` collection for chronological blog articles and a `kb-articles` collection for hierarchical knowledge base content. Keeping these separate avoids forced compromises in taxonomy (category vs. parent-child hierarchy), SEO schema (`Article` vs. `TechArticle`/`FAQPage`), and admin workflow. Shared supporting collections — `authors`, `categories`, `media` — serve both tracks. Four official Payload plugins cover the majority of needs: `@payloadcms/plugin-seo` for managed meta fields, `@payloadcms/plugin-nested-docs` for KB hierarchy and breadcrumbs, `@payloadcms/plugin-search` for full-text search, and `@payloadcms/richtext-lexical` as the only actively-developed rich text editor. Native Next.js 16 primitives (`generateMetadata`, `app/sitemap.ts`, `next/og`) replace all previously common third-party SEO packages.

The dominant risk class for this integration is Phase 1 setup: nine of the fifteen documented pitfalls must be addressed before writing a single collection definition. The most consequential traps are CSS bleed from the existing root layout into Payload's admin panel (requires wrapping all existing routes in a `(marketing)` route group before Payload install), schema drift from leaving `push: true` in the PostgreSQL adapter (must be disabled immediately and replaced with versioned migrations), and a Next.js version / Turbopack compatibility window (Payload `>=3.73.0` + Next.js `>=16.2.0` required). All three have clear, documented prevention strategies and were fully resolved in Payload 3.73.0 (released January 2026).

## Key Findings

### Recommended Stack

Payload CMS 3.x integrates directly into the existing Next.js 16 app as a set of route group files and a `payload.config.ts` at the repo root. No separate process, no Docker sidecar, no external CMS service. All `@payloadcms/*` packages must be pinned at the same minor version (currently `3.77.0`). The database adapter (`@payloadcms/db-postgres`) uses Drizzle ORM internally and connects to a dedicated Supabase PostgreSQL instance via the transaction pooler. The Turbopack + Payload incompatibility that affected versions before 3.73.0 is fully resolved — but only when paired with Next.js `>=16.2.0`.

**Core technologies:**
- `payload@3.77.0` + `@payloadcms/next@3.77.0`: Core CMS engine and Next.js adapter — only Payload 3.x supports true Next.js embedding
- `@payloadcms/db-postgres@3.77.0`: PostgreSQL adapter via Drizzle ORM — matches existing Supabase infrastructure, no new DB vendor
- `@payloadcms/richtext-lexical@3.77.0`: Lexical rich text editor — only actively-developed editor; Slate is deprecated and removed in Payload 4.0
- `@payloadcms/plugin-seo@3.77.0`: Managed meta fields — integrates directly with Next.js `generateMetadata`, handles OG image, title, description per document
- `@payloadcms/plugin-nested-docs@3.77.0`: KB hierarchy + breadcrumbs — essential for knowledge base section structure
- `@payloadcms/plugin-search@3.77.0`: Synced search collection — avoids full-text query overhead on main Postgres tables
- `sharp@0.34.5`: Image resizing — explicitly required by Payload for media uploads
- `schema-dts@1.1.5` (dev): TypeScript types for Schema.org JSON-LD — compile-time validation, zero runtime overhead
- Native `app/sitemap.ts`, `generateMetadata`, `next/og`: No external SEO packages needed; Next.js 16 covers the full requirement natively

**What NOT to use:**
- `@payloadcms/richtext-slate`: Deprecated, removed in Payload 4.0
- `next-seo`: Pages Router library, anti-pattern with App Router
- `next-sitemap`: Superseded by native `app/sitemap.ts` in Next.js 15+
- `@payloadcms/db-sqlite` in production: Dev-only adapter
- REST API for frontend data fetching: Use Payload Local API (`getPayload()`) — no HTTP overhead when co-located

### Expected Features

The full feature analysis is in `.planning/research/FEATURES.md`. Summary below.

**Must have (table stakes — MVP):**

Blog:
- Post collection: title, slug, body (Lexical), excerpt, featured image, author relationship, categories, `publishedAt`, `updatedAt`, draft status
- Authors collection: name, bio, avatar, role — required for Google E-E-A-T before any content goes live
- Categories collection: taxonomy shared between blog and KB
- Blog listing page with pagination (`/blog`)
- Individual post page (`/blog/[slug]`) with Article JSON-LD
- Draft + publish workflow (Payload versions system)
- Canonical URL + meta title/description + OG image per post (via SEO plugin)
- Mobile-responsive layout

Knowledge Base:
- KB articles collection: title, slug, body (Lexical), section grouping, draft status
- KB listing page (`/help` or `/docs`) grouped by section
- Individual article page (`/help/[slug]`)
- Breadcrumb navigation (via nested-docs plugin)
- Meta title/description per article (via SEO plugin)

SEO infrastructure (both):
- Dynamic XML sitemap (`app/sitemap.ts`) — excludes drafts and `noIndex` content
- `robots.txt` — blocks `/admin`
- `noIndex` boolean toggle per document
- On-demand revalidation via Payload `afterChange` hooks calling `revalidatePath()`
- Admin panel excluded from sitemap

**Should have (differentiators — add after MVP is stable):**
- Reading time computed field (beforeValidate hook, word count / 200 WPM)
- Table of contents auto-generated from headings (medium complexity)
- Author bio at post footer (low effort once Authors collection exists)
- Tags in addition to categories (cross-cutting navigation)
- Live Preview in admin panel (requires Draft Mode setup)
- Scheduled publishing (Payload's built-in jobs queue)
- `FAQPage` schema on KB articles with FAQ Lexical blocks
- Related posts (relationship field, manual curation)
- "Was this helpful?" feedback collection on KB articles
- Section landing pages (`/help/getting-started`)
- Search UI (once 15+ KB articles exist)

**Defer (v2+ or post-launch):**
- Role-based access control (all 2-5 authors can be admin for MVP)
- `HowTo` schema (high complexity, requires structured step blocks)
- Internal link suggestions in admin (requires custom admin UI)
- Multi-language / i18n
- Object storage migration (start with local filesystem volume mount)

**Anti-features (explicitly do NOT build):**
- Comment system: maintenance overhead, zero SEO value
- Newsletter/email capture in CMS: keep as static form component
- CMS-managed landing page sections: risks breaking GSAP animations
- AI-generated content: penalizes E-E-A-T; human authors only
- Algolia/Elasticsearch: overkill at this scale; plugin-search is sufficient

### Architecture Approach

Payload lives inside the Next.js `/app` directory using two route groups: `(payload)` contains the admin panel catch-all and REST API route handler; `(marketing)` (or `(frontend)`) contains all existing landing page routes. This route group separation is not optional — it is the only way to prevent Payload's admin CSS from being wrapped by the landing page root layout. The existing `app/layout.tsx` must be reduced to a minimal HTML shell (no `globals.css` import); the Tailwind import moves into `(marketing)/layout.tsx`. All frontend pages use Payload's Local API via `getPayload({ config })` for direct database access with zero HTTP overhead.

**Major components:**
1. `payload.config.ts` (repo root) — single source of truth: collections, DB adapter, plugins, editor, media config
2. `app/(payload)/admin/[[...segments]]/page.tsx` — renders the entire Payload admin UI as React Server Components; communicates with DB via Local API
3. `app/(payload)/api/[...slug]/route.ts` — handles all REST API endpoints (secondary path; primarily for external consumers)
4. `app/(marketing)/layout.tsx` — existing landing page layout (GSAP, Tailwind, global fonts) — fully isolated from Payload
5. `app/(marketing)/blog/[slug]/page.tsx` and `app/(marketing)/kb/[slug]/page.tsx` — frontend content pages using `getPayload()` for data
6. `src/collections/` — TypeScript collection definitions (Posts, KBArticles, Authors, Categories, Media, Users)
7. `src/migrations/` — Drizzle DDL migration files generated by `npx payload migrate:create`, committed to git
8. `app/sitemap.ts` — dynamic sitemap querying both collections via Local API
9. Docker volume mount at `/app/public/media` — persistent media storage across container restarts

**Data flow:** Visitor request → Next.js RSC → `getPayload()` → Drizzle ORM → Supabase PostgreSQL (dedicated CMS project). No HTTP in this path. Revalidation: Payload `afterChange` hook → `revalidatePath('/blog/[slug]')` → Next.js ISR cache invalidation.

### Critical Pitfalls

The full list of 15 pitfalls is in `.planning/research/PITFALLS.md`. The top five by impact:

1. **Root layout CSS bleeds into Payload admin (Critical)** — The existing `app/layout.tsx` importing `globals.css` (Tailwind v4 with `preflight` reset) will break Payload's admin panel styling. Move ALL existing routes into `app/(marketing)/` and strip `globals.css` from the root layout BEFORE installing Payload. This is the first step of Phase 1, not an afterthought.

2. **`push: true` causes irreversible schema drift (Critical)** — Payload's default `push: true` in the postgres adapter auto-mutates the database without migration files. Set `push: false` and configure `migrationDir: './src/migrations'` in the very first commit. Never use push mode against the Supabase project.

3. **Payload config importing client code breaks CLI and builds (Critical)** — Any direct import of React components or CSS files (including transitively via `@payloadcms/richtext-lexical/react`) in `payload.config.ts` causes `TypeError: Unknown file extension ".css"` on every CLI command and production build. Use Payload's component path string syntax (`'/src/components/MyComponent#MyComponent'`) for all admin UI overrides.

4. **Next.js version / Turbopack compatibility (Critical)** — Payload `<3.73.0` breaks with Next.js 16's Turbopack. Conversely, using `"next": "latest"` may pull in canary versions beyond Payload's tested window. Pin both: Payload `>=3.73.0` and Next.js `>=16.2.0`. Lock these versions explicitly, do not use `latest` tags.

5. **Docker media storage lost on redeploy (Moderate, High consequence)** — Local filesystem media stored in `/app/public/media` is wiped on every container replacement. Configure a named Docker volume (or object storage plugin) before uploading any media files. This is cheap to set up in Coolify and catastrophic to fix retroactively.

## Implications for Roadmap

Based on the dependency graph in ARCHITECTURE.md and the phase-specific pitfall warnings in PITFALLS.md, three phases are clearly indicated. Phase 1 has the highest density of critical setup steps — treating it as a proper phase (not a "quick install") is essential.

### Phase 1: Infrastructure Setup and CMS Foundation

**Rationale:** All nine Phase 1 pitfalls (CSS isolation, version pinning, push mode, config purity, tsconfig alias, schema provisioning, secret generation, middleware check, build verification) must be resolved before any collection work begins. Attempting to build collections on a misconfigured foundation causes hard-to-trace failures later. This phase has no dependencies on content decisions.

**Delivers:** A running Payload admin panel at `/admin` with no landing page regressions, migration-based schema management, and verified `next build` output. The existing landing page continues to function identically.

**Key tasks:**
- Move existing `app/` into `app/(marketing)/` route group; strip root layout to HTML shell
- Verify landing page at `/` still works
- Pin Next.js to `>=16.2.0` in `package.json`
- Install all Payload packages at `3.77.0` with `--legacy-peer-deps`
- Wrap `next.config.mjs` with `withPayload()` (rename from `.ts` to `.mjs`)
- Add `@payload-config` alias to `tsconfig.json`
- Configure `postgresAdapter` with `push: false`, `migrationDir: './src/migrations'`
- Create dedicated Supabase project for CMS; provision schema with `CREATE SCHEMA IF NOT EXISTS`
- Generate `PAYLOAD_SECRET` with `openssl rand -base64 32`
- Copy `(payload)` route group files from Payload blank template
- Create minimal `payload.config.ts` with Users collection
- Run `next build` and verify both landing page and `/admin` routes work
- Add `serverComponentsExternalPackages` for dev performance

**Avoids:** Pitfalls 1, 2, 3, 4, 5, 6, 10, 11, 13

**Research flag:** Standard patterns — well-documented installation sequence in official Payload docs. Skip `research-phase`. The pitfalls are the research.

### Phase 2: Content Model and Collections

**Rationale:** With the infrastructure verified, define all collections in a single coordinated phase. The dependency order within this phase is strict: Media → Authors + Categories → Posts + KBArticles. The SEO plugin, nested-docs plugin, and search plugin are configured here alongside the collections they extend. This phase produces the admin panel that content editors can actually use.

**Delivers:** A fully functional admin panel with all collections, draft workflow, SEO fields, media uploads, and migration-tracked schema. Content editors can begin authoring before any public-facing routes exist.

**Key tasks:**
- Media collection (with image sizes: thumbnail, card, tablet)
- Authors collection (name, bio, avatar, role)
- Categories collection (name, slug, description)
- Posts collection: title, slug, body (Lexical with full feature set), excerpt, featured image, authors (relationship), categories (relationship), `publishedAt`, `noIndex`, versions/drafts/autosave, SEO plugin fields
- KBArticles collection: title, slug, body (Lexical), section (select), `updatedAt`, `noIndex`, versions/drafts, nested-docs plugin, SEO plugin fields
- Configure `plugin-search` on KBArticles
- Set `read: () => true` access control on all public collections (Authors, Categories, Posts, KBArticles)
- Implement hook context guard pattern for any `afterChange` hooks
- Run `npx payload migrate:create --name initial_schema` and commit `src/migrations/`
- Verify admin panel CRUD for each collection

**Uses:** `@payloadcms/plugin-seo`, `@payloadcms/plugin-nested-docs`, `@payloadcms/plugin-search`, `@payloadcms/richtext-lexical`
**Avoids:** Pitfalls 9, 12, 14, 15

**Research flag:** Standard patterns — all collections follow official Payload website template. Skip `research-phase`.

### Phase 3: Frontend Routes and SEO Integration

**Rationale:** Frontend routes have a hard dependency on the collections existing with published content to test against. ISR revalidation hooks cannot be verified without live frontend routes. This phase converts the data model into public-facing pages with full SEO instrumentation.

**Delivers:** Public `/blog`, `/blog/[slug]`, `/help`, `/help/[slug]` routes with Article JSON-LD, `generateMetadata`, canonical URLs, dynamic sitemap, robots.txt, and on-demand revalidation. Site is fully indexable by Google upon completion.

**Key tasks:**
- `app/(marketing)/blog/page.tsx` — listing with pagination
- `app/(marketing)/blog/[slug]/page.tsx` — post page with Lexical HTML rendering, Article JSON-LD, `generateMetadata`
- `app/(marketing)/help/page.tsx` — KB listing grouped by section
- `app/(marketing)/help/[slug]/page.tsx` — KB article with breadcrumbs, `generateMetadata`
- `app/sitemap.ts` — dynamic sitemap covering both collections, excluding drafts and `noIndex`
- `app/robots.ts` — block `/admin`
- Payload `afterChange` hooks on Posts and KBArticles calling `revalidatePath()`
- Use `convertLexicalToHTML()` from `@payloadcms/richtext-lexical/html` for RSC rendering
- Verify `next build` and check rendered HTML for correct meta tags and JSON-LD
- Design and style all pages to match PackBee brand

**Uses:** `schema-dts`, native `generateMetadata`, native `app/sitemap.ts`, Payload Local API
**Avoids:** Pitfall 15 (correct Lexical import path)

**Research flag:** SEO structured data implementation (`FAQPage` schema on KB articles) may need a quick research check. Blog and KB page structure follows standard Next.js + Payload patterns.

### Phase 4: Production Hardening and Deployment

**Rationale:** Deployment-specific concerns — Docker volume for media persistence, Coolify configuration, environment variable audit, migration pipeline in CI/CD — are deferred until the application is functionally complete. Addressing them earlier creates moving-target configuration.

**Delivers:** Production-ready deployment on Coolify/Hetzner with persistent media storage, automated migrations on deploy, and verified environment variable management.

**Key tasks:**
- Configure named Docker volume for `/app/public/media` in Coolify service config
- Add `npx payload migrate` step to CI/CD deployment pipeline (runs before server start)
- Environment variable audit: `DATABASE_URI` (port 6543 + `?pgbouncer=true`), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`
- Verify Next.js standalone output in `next.config.mjs`
- Test full redeploy cycle: confirm media files persist, confirm migration runs
- (Optional) Evaluate `@payloadcms/storage-s3` if volume management proves fragile

**Avoids:** Pitfall 8 (media loss on redeploy)

**Research flag:** Standard deployment patterns for Payload + Coolify. Community documentation exists. Skip `research-phase`.

### Phase Ordering Rationale

- **Phase 1 before everything:** Nine critical setup pitfalls are Phase 1-specific. None of them can be retroactively fixed without potentially breaking existing work. Route group restructure, in particular, becomes disruptive if deferred.
- **Phase 2 before Phase 3:** Frontend routes have a compile-time dependency on collection types (Payload generates TypeScript types from collections). Building routes before collections exist means building against `any` types.
- **Phase 3 before Phase 4:** Deployment configuration for a single-route app is premature. Full-route deployment tests are more meaningful when all routes exist.
- **Posts and KBArticles in parallel within Phase 2:** These two collections have no inter-dependency once Media, Authors, and Categories exist. They can be developed simultaneously if multiple contributors are available.
- **Differentiator features (reading time, TOC, related posts, search UI):** All depend on content volume to be meaningful. They belong in a Phase 5 polish pass or are folded into Phase 3 design work, not in the structural phases.

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (SEO integration):** `FAQPage` schema implementation within Lexical blocks is documented but involves a custom `BlocksFeature` configuration that has sparse examples. Worth a targeted 30-minute research pass before implementing KB article pages.

Phases with standard patterns (skip `research-phase`):
- **Phase 1:** Official Payload installation docs are comprehensive. The pitfalls file IS the research.
- **Phase 2:** Payload website template provides direct reference for all collection structures.
- **Phase 4:** Coolify + Payload deployment is documented with community examples and consistent with official Payload production docs.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package versions verified against npm registry. Turbopack compatibility verified against release notes and GitHub issues. No speculative picks. |
| Features | HIGH | Based on official Payload docs, verified plugin capabilities, and cross-referenced against SaaS SEO best practices from multiple sources. MVP scope is well-bounded. |
| Architecture | HIGH | Route group pattern and Local API usage verified against official Payload installation docs and website template. Data flow is the documented primary pattern. |
| Pitfalls | HIGH | 13 of 15 pitfalls verified against official docs and GitHub issues. Two rated MEDIUM (withPayload + Tailwind v4 PostCSS interaction, Lexical RSC rendering API stability in 3.73+). |

**Overall confidence:** HIGH

### Gaps to Address

- **Tailwind v4 + `withPayload()` interaction (Pitfall 5, MEDIUM confidence):** The specific behavior of `@tailwindcss/postcss` v4 when wrapped by `withPayload()` was not directly verified in an existing app. Mitigation: run `next build` immediately after wrapping and before adding any collections. If styles break, the webpack merge strategy in the pitfalls doc is the fix.

- **Lexical RSC rendering API stability (Pitfall 15, MEDIUM confidence):** The `RenderLexical` server component is marked experimental in Payload docs. The HTML converter (`convertLexicalToHTML()`) is the stable path and is recommended here, but its exact import path for Payload 3.73+ should be verified at implementation time.

- **`FAQPage` schema in Lexical blocks:** The mechanism (custom `BlocksFeature` + JSON-LD extraction) is well-understood conceptually but lacks a concrete code example in the official Payload docs. Will need a focused research pass during Phase 3 planning.

- **`schedulePublish` jobs queue in production:** Scheduled publishing uses Payload's jobs queue system, which has infrastructure requirements in production (persistent worker, not just the web process). This was identified as a differentiator feature to defer post-MVP, but when it is scheduled, the jobs queue deployment pattern needs research.

## Sources

### Primary (HIGH confidence)
- [Payload 3.x Installation Docs](https://payloadcms.com/docs/getting-started/installation) — installation sequence, route groups, withPayload wrapper
- [Payload PostgreSQL Adapter Docs](https://payloadcms.com/docs/database/postgres) — migration mode, push vs. migrate, schemaName
- [Payload SEO Plugin Docs](https://payloadcms.com/docs/plugins/seo) — field configuration, generateURL, generateMetadata integration
- [Payload Nested Docs Plugin Docs](https://payloadcms.com/docs/plugins/nested-docs) — KB hierarchy, breadcrumbs
- [Payload Rich Text Overview](https://payloadcms.com/docs/rich-text/overview) — Lexical vs. Slate deprecation decision
- [Payload Access Control Docs](https://payloadcms.com/docs/access-control/overview) — public read defaults
- [Payload Hooks Context Docs](https://payloadcms.com/docs/hooks/context) — infinite loop prevention
- [Payload Production Deployment Docs](https://payloadcms.com/docs/production/deployment) — PAYLOAD_SECRET, media, migrations
- [Payload Performance Docs](https://payloadcms.com/docs/performance/overview) — serverComponentsExternalPackages
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) — schema-dts recommendation
- [Next.js generateSitemaps API](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) — native sitemap support
- [Payload Website Template](https://github.com/payloadcms/payload/tree/main/templates/website) — collection reference architecture
- [GitHub issue #8878](https://github.com/payloadcms/payload/issues/8878) — Tailwind reset breaks admin
- [GitHub issue #14035](https://github.com/payloadcms/payload/issues/14035) — push mode serial type error
- [GitHub issue #14354](https://github.com/payloadcms/payload/issues/14354) — withPayload Turbopack conflict resolution
- [GitHub issue #5822](https://github.com/payloadcms/payload/issues/5822) — schemaName not auto-created
- npm registry direct queries — package version verification

### Secondary (MEDIUM confidence)
- [buildwithmatija.com: Next.js 16 + Payload compatibility](https://www.buildwithmatija.com/blog/payload-cms-nextjs-16-compatibility-breakthrough) — Payload 3.73.0 version requirements cross-referenced with GitHub release notes
- [buildwithmatija.com: Push to migrations guide](https://www.buildwithmatija.com/blog/payloadcms-postgres-push-to-migrations) — migration workflow, aligned with official docs
- [dFlow: PayloadCMS Tips and Tricks](https://dflow.sh/blog/payloadcms-tips-and-tricks) — config import pitfall, hook context guard
- [sliplane.io: Payload CMS in Docker](https://sliplane.io/blog/how-to-run-payload-cms-in-docker) — container volume mount pattern
- [Payload + Supabase Setup Guide](https://payloadcms.com/posts/guides/setting-up-payload-with-supabase-for-your-nextjs-app-a-step-by-step-guide) — transaction pooler recommendation

### Tertiary (LOW confidence)
- None — all findings are backed by HIGH or MEDIUM sources.

---
*Research completed: 2026-02-18*
*Ready for roadmap: yes*
