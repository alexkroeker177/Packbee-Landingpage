# PackBee Blog & Knowledge Base

## What This Is

A blog and knowledge base powered by Payload CMS, embedded directly into the existing PackBee Next.js landing page. The blog targets SEO / organic traffic for e-commerce fulfillment keywords, while the knowledge base serves both customer help docs and industry guides. Content is authored by a small team of 2-5 writers.

## Core Value

Drive organic traffic to PackBee through SEO-optimized blog content and provide a self-serve knowledge base for customers and prospects.

## Requirements

### Validated

- ✓ Landing page with scroll-triggered animations (GSAP + Framer Motion) — existing
- ✓ Responsive design with mobile-first approach (Tailwind CSS 4) — existing
- ✓ Interactive packing prototype demonstration — existing
- ✓ 3D feature carousel showcase — existing
- ✓ Feature sections with animated reveals — existing
- ✓ Navbar with mobile menu — existing
- ✓ Testimonials section — existing
- ✓ Footer — existing
- ✓ Next.js 16 + React 19 + TypeScript stack — existing

### Active

- [ ] Payload CMS embedded in Next.js app with admin panel
- [ ] Dedicated Supabase PostgreSQL instance for CMS data
- [ ] Blog post collection (title, body, author, featured image, excerpt, slug)
- [ ] Author profiles collection (name, bio, avatar, role)
- [ ] Categories and tags for content organization
- [ ] Knowledge base collection (help docs + industry guides, separate from blog)
- [ ] SEO meta tags and OG image support per post/page
- [ ] Auto-generated XML sitemap
- [ ] Schema.org structured data (Article, FAQ markup)
- [ ] Blog listing page with pagination
- [ ] Individual blog post pages with rich content rendering
- [ ] Knowledge base listing and article pages
- [ ] Local filesystem media storage for uploaded images
- [ ] Author assignment and display on posts

### Out of Scope

- Blog/knowledge base visual design — deferring design decisions to later, CMS structure first
- CMS-managed landing pages — current landing page stays code-driven
- Guest/external author workflows — only internal team for now
- Comments or social features on posts — not needed for SEO-driven content
- Newsletter/email integration — can add later
- Using existing PackBee Supabase instance — dedicated instance to keep data separated
- MongoDB — using PostgreSQL via Supabase instead

## Context

- PackBee is a SaaS pick-and-pack verification system integrating with BillBee
- The landing page is an existing Next.js 16 app with heavy animation (GSAP, Framer Motion)
- The main PackBee product has a separate frontend (packbee-frontend) and backend (packbee-backend)
- This landing page is a standalone repo, not part of the main product monorepo
- Payload CMS 3.x supports PostgreSQL and native Next.js integration (embedded in the same app)
- The team has existing Supabase experience from the main product
- Hosting is on Hetzner via Coolify with Docker deployments

## Constraints

- **Tech stack**: Must use Payload CMS 3.x with PostgreSQL adapter (not MongoDB)
- **Database**: Dedicated Supabase project, separate from main PackBee database
- **Media**: Local filesystem storage (not S3/cloud storage)
- **Embedding**: Payload runs inside the existing Next.js app (not a separate service)
- **Compatibility**: Must not break existing landing page animations and functionality
- **Authors**: Support 2-5 team members with individual profiles

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Embed Payload in existing Next.js app | Simpler deployment, single codebase, native integration | — Pending |
| Dedicated Supabase PostgreSQL | Keep CMS data isolated from product data | — Pending |
| Local filesystem for media | Simple setup, works with Hetzner/Coolify hosting | — Pending |
| Blog + Knowledge Base as separate collections | Different content types serve different audiences (SEO vs support) | — Pending |
| Defer design decisions | Focus on CMS structure and content modeling first | — Pending |

---
*Last updated: 2026-02-18 after initialization*
