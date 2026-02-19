# Roadmap: PackBee Blog & Knowledge Base

## Overview

This milestone embeds Payload CMS 3.x into the existing PackBee Next.js 16 landing page, delivering a blog and knowledge base powered by a dedicated Supabase PostgreSQL instance. Work proceeds in three phases: a foundation phase that establishes a safe, verified CMS installation without touching existing landing page functionality; a content model phase that defines all collections and editorial workflow so authors can begin writing; and a frontend phase that publishes all public-facing routes with full SEO instrumentation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (1.1, 2.1): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Infrastructure** - Embed Payload CMS safely in the existing Next.js app without breaking the landing page
- [x] **Phase 2: Content Model** - Define all collections, editorial workflow, and SEO fields so authors can create content in the admin panel
- [x] **Phase 3: Frontend & SEO** - Build all public-facing routes with full SEO instrumentation so the site is indexable and live
- [x] **Phase 4: Design & Styling** - Style the blog and knowledge base pages to match PackBee's brand and deliver a polished reading experience

## Phase Details

### Phase 1: Infrastructure

**Goal**: Payload CMS is running at `/admin` and the existing landing page continues to work identically
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06

**Success Criteria** (what must be TRUE):
1. Visiting `/` renders the existing landing page with all animations intact — no visual regressions
2. Visiting `/admin` opens the Payload admin panel with login screen — no CSS bleed from landing page styles
3. `next build` completes without errors covering both route groups
4. Schema changes are tracked as migration files in `src/migrations/` — `push: true` is disabled
5. A media upload submitted through the admin panel saves to local filesystem without errors

**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Route group restructure, Payload 3.77.0 install, and (payload) route group boilerplate
- [x] 01-02-PLAN.md — Supabase database connection, initial migration, media uploads, and admin login

---

### Phase 2: Content Model

**Goal**: All collections are defined in the admin panel with draft/publish workflow and SEO fields — content editors can author posts and KB articles before any public routes exist
**Depends on**: Phase 1
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05, KB-01, SEO-01, SEO-02, SEO-03, SEO-09, SEO-10, EDIT-01, EDIT-02, EDIT-03, EDIT-04

**Success Criteria** (what must be TRUE):
1. An editor can create a blog post with title, rich text body, excerpt, featured image, author, categories, tags, and publish it — the post appears as published in the admin list
2. An editor can create a KB article with title, body, section grouping, and publish it — the article appears as published in the admin list
3. An editor can save a post as a draft, make changes, and the version history shows both versions
4. A previously published post can be previewed live in the admin panel before changes are republished
5. A post can be scheduled for future publishing and the admin panel shows the scheduled time

**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Supporting collections (Authors, Categories, Sections), Posts collection with editorial workflow, SEO plugin, jobs config, and migration
- [x] 02-02-PLAN.md — KnowledgeBase collection with section grouping, migration, and admin panel verification

---

### Phase 3: Frontend & SEO

**Goal**: All public-facing routes are live and fully indexable — visitors can read blog posts and KB articles, and search engines can crawl and understand all content
**Depends on**: Phase 2
**Requirements**: BLOG-06, BLOG-07, BLOG-08, KB-02, KB-03, KB-04, KB-05, KB-06, KB-07, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08

**Success Criteria** (what must be TRUE):
1. Visiting `/blog` shows a paginated list of published posts — drafts and noIndex posts are not visible
2. Visiting `/blog/[slug]` renders the full post with rich text content, author bio, and Article JSON-LD structured data in the page source
3. Visiting `/help` shows KB articles grouped by section, `/help/[section-slug]` shows a section landing page, and `/help/[slug]` shows an individual article with breadcrumb navigation
4. The XML sitemap at `/sitemap.xml` includes all published, non-noIndex blog posts and KB articles — `/admin` is blocked in `robots.txt`
5. Publishing or updating any post or article in the admin panel causes its public page to update without a full site rebuild (on-demand revalidation)

**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Schema updates (contentType, articleType, steps[], faqs[]), search plugin, revalidation hooks, and migration
- [x] 03-02-PLAN.md — Blog pages (/blog, /blog/[slug]) with Article/HowTo JSON-LD, author bio, sitemap.ts, and robots.ts
- [x] 03-03-PLAN.md — KB pages (/help, /help/[slug]) with section grouping, search, breadcrumbs, and FAQPage JSON-LD

---

### Phase 4: Design & Styling

**Goal**: Blog and knowledge base pages are visually polished, consistent with PackBee's brand, and deliver a professional reading experience across all devices
**Depends on**: Phase 3

**Success Criteria** (what must be TRUE):
1. All blog and KB pages render with the frosted-glass Navbar at top and dark Footer at bottom — consistent with the landing page
2. Rich text content (blog posts, KB articles) is styled via prose-amber typography using brand color tokens — no raw Tailwind grays
3. Blog listing shows a branded amber header with honeycomb texture and posts in a responsive card grid
4. Help Center shows a hero-level search bar with branded background and sections displayed as navigable cards
5. Breadcrumbs on KB pages use chevron separators and brand tokens
6. Zero raw `text-gray-*`, `bg-yellow-*` classes remain on any blog or help page — all converted to CSS custom property tokens

**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Install @tailwindcss/typography, prose-amber utility, and BlogPageChrome wrapper component
- [x] 04-02-PLAN.md — Blog listing (card grid, branded header) and blog post (prose-amber, author bio card) styling
- [x] 04-03-PLAN.md — Help listing (search hero, section cards) and help article (breadcrumbs, prose-amber) styling

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure | 2/2 | Complete | 2026-02-18 |
| 2. Content Model | 2/2 | Complete | 2026-02-18 |
| 3. Frontend & SEO | 3/3 | Complete | 2026-02-19 |
| 4. Design & Styling | 3/3 | Complete | 2026-02-19 |
