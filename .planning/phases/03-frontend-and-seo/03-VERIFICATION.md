---
phase: 03-frontend-and-seo
verified: 2026-02-19T00:05:00Z
status: gaps_found
score: 4/5 must-haves verified
gaps:
  - truth: "Visiting /blog shows a paginated list of published posts — drafts and noIndex posts are not visible"
    status: partial
    reason: "Blog listing page filters drafts via _status=published and overrideAccess: false, but does NOT exclude posts where meta.noIndex=true. noIndex posts appear in the listing even though the ROADMAP success criterion explicitly requires they not be visible."
    artifacts:
      - path: "app/(marketing)/blog/page.tsx"
        issue: "payload.find() query missing { 'meta.noIndex': { not_equals: true } } clause. Only filters _status: published."
      - path: "app/(marketing)/help/page.tsx"
        issue: "Browse-mode article query also missing noIndex filter. KB articles with noIndex=true appear in section groups."
    missing:
      - "Add { 'meta.noIndex': { not_equals: true } } to the where clause in blog/page.tsx payload.find()"
      - "Add { 'meta.noIndex': { not_equals: true } } to the KB article queries in help/page.tsx (browse mode)"
human_verification:
  - test: "Publish a blog post with noIndex=true checked, then visit /blog"
    expected: "The noIndex post should NOT appear in the listing"
    why_human: "Requires CMS interaction to create a published + noIndex post and verify it is hidden from the listing"
  - test: "Visit /blog/[slug] for a tutorial post and check page source"
    expected: "Page source should contain application/ld+json with @type: HowTo and step array — not Article"
    why_human: "JSON-LD is conditionally rendered based on contentType field value which requires a real post to test"
  - test: "Publish a KB article with articleType=faq and at least one FAQ, then visit /help/[slug]"
    expected: "Page source should contain application/ld+json with @type: FAQPage and mainEntity array"
    why_human: "FAQPage JSON-LD is conditionally rendered based on articleType and faqs array which requires real content"
  - test: "Publish a blog post, then visit /sitemap.xml"
    expected: "The post URL should appear in the sitemap; if noIndex=true, it should NOT appear"
    why_human: "Requires running server and real published content to verify sitemap URL inclusion"
  - test: "Update a blog post in the admin panel and verify the public page reflects the change"
    expected: "The /blog/[slug] page should serve updated content without a full rebuild (on-demand revalidation via afterChange hook)"
    why_human: "Requires running CMS + Next.js server to observe revalidation behavior"
---

# Phase 3: Frontend and SEO Verification Report

**Phase Goal:** All public-facing routes are live and fully indexable — visitors can read blog posts and KB articles, and search engines can crawl and understand all content
**Verified:** 2026-02-19T00:05:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Visiting /blog shows paginated published posts — drafts and noIndex posts not visible | PARTIAL | Drafts filtered via `_status=published` + `overrideAccess: false`. noIndex posts NOT excluded — `meta.noIndex` filter absent from listing query. |
| 2 | Visiting /blog/[slug] renders full post with rich text, author bio, and Article JSON-LD | VERIFIED | `RichText` from `@payloadcms/richtext-lexical/react` used. Author bio section renders name/role/bio/avatar. Article JSON-LD present. HowTo JSON-LD conditional on `contentType=tutorial`. |
| 3 | Visiting /help shows KB articles grouped by section; /help/[section-slug] shows section landing; /help/[slug] shows article with breadcrumbs | VERIFIED | `/help` page fetches sections + articles per section, groups them, skips empty sections. `/help/[slug]` disambiguates via DB (section first, article second). Breadcrumb nav present on both section and article views. `notFound()` called for unmatched slugs. |
| 4 | Sitemap at /sitemap.xml includes all published non-noIndex blog posts and KB articles; /admin blocked in robots.txt | VERIFIED | `sitemap.ts` at app root. Queries both collections with `_status=published` AND `meta.noIndex: { not_equals: true }`. `robots.ts` disallows `/admin`, links to `/sitemap.xml`. |
| 5 | Publishing or updating any post/article causes public page to update without full rebuild | VERIFIED | `revalidatePost` hook calls `revalidatePath('/blog/[slug]', 'page')` + `revalidateTag(CACHE_TAGS.POSTS_SITEMAP, 'everything')`. `revalidateKB` hook calls `revalidatePath('/help/[slug]', 'page')`, `revalidatePath('/help', 'page')`, `revalidateTag(CACHE_TAGS.KB_SITEMAP, 'everything')`. Both hooks registered in `afterChange` on their collections. Unpublish case handled. |

**Score:** 4/5 truths verified (1 partial)

---

### Required Artifacts

| Artifact | Lines | Exists | Substantive | Wired | Status |
|----------|-------|--------|-------------|-------|--------|
| `app/(marketing)/blog/page.tsx` | 113 | YES | YES | YES — payload.find posts, pagination, author | VERIFIED |
| `app/(marketing)/blog/[slug]/page.tsx` | 212 | YES | YES | YES — RichText, ld+json, generateMetadata, generateStaticParams | VERIFIED |
| `app/(marketing)/help/page.tsx` | 177 | YES | YES | YES — sections query, search query, overrideAccess | VERIFIED |
| `app/(marketing)/help/[slug]/page.tsx` | 307 | YES | YES | YES — DB disambiguation, breadcrumbs, FAQPage JSON-LD, RichText | VERIFIED |
| `app/sitemap.ts` | 63 | YES | YES | YES — CACHE_TAGS imported, both collections queried with noIndex filter | VERIFIED |
| `app/robots.ts` | 9 | YES | YES | YES — disallow /admin, sitemap link | VERIFIED |
| `src/lib/cache-tags.ts` | 4 | YES | YES | YES — imported by both hooks and sitemap.ts | VERIFIED |
| `src/collections/hooks/revalidatePost.ts` | 25 | YES | YES | YES — registered in Posts.ts afterChange | VERIFIED |
| `src/collections/hooks/revalidateKB.ts` | 27 | YES | YES | YES — registered in KnowledgeBase.ts afterChange | VERIFIED |
| `src/collections/Posts.ts` | 110 | YES | YES | YES — contentType, steps[], revalidatePost hook | VERIFIED |
| `src/collections/KnowledgeBase.ts` | 93 | YES | YES | YES — excerpt, articleType, faqs[], revalidateKB hook | VERIFIED |
| `payload.config.ts` | 114 | YES | YES | YES — searchPlugin registered, seoPlugin with noIndex field | VERIFIED |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `blog/page.tsx` | payload posts collection | `payload.find({ collection: 'posts' })` | WIRED | Fetches posts with depth:1, overrideAccess:false, _status:published |
| `blog/[slug]/page.tsx` | `@payloadcms/richtext-lexical/react` | `import { RichText }` | WIRED | `<RichText data={post.body} />` renders lexical body |
| `blog/[slug]/page.tsx` | `application/ld+json` | inline `<script>` tag | WIRED | Article JSON-LD + HowTo conditional on contentType=tutorial |
| `help/page.tsx` | search collection | `payload.find({ collection: 'search' })` | WIRED | Search mode queries plugin-search collection with title filter |
| `help/page.tsx` | sections collection | `payload.find({ collection: 'sections' })` | WIRED | Browse mode fetches all sections + articles per section |
| `help/[slug]/page.tsx` | sections + knowledge-base | DB disambiguation in `queryBySlug` | WIRED | Section tried first, article second, notFound() if neither |
| `help/[slug]/page.tsx` | FAQPage JSON-LD | conditional on `articleType === 'faq'` | WIRED | faqJsonLd rendered only when hasFaqs=true |
| `sitemap.ts` | `src/lib/cache-tags.ts` | `import { CACHE_TAGS }` | WIRED | `{ tags: [CACHE_TAGS.POSTS_SITEMAP, CACHE_TAGS.KB_SITEMAP] }` |
| `revalidatePost.ts` | `src/lib/cache-tags.ts` | `import { CACHE_TAGS }` | WIRED | Uses CACHE_TAGS.POSTS_SITEMAP in revalidateTag call |
| `revalidateKB.ts` | `src/lib/cache-tags.ts` | `import { CACHE_TAGS }` | WIRED | Uses CACHE_TAGS.KB_SITEMAP in revalidateTag call |
| `Posts.ts` | `hooks/revalidatePost.ts` | `hooks.afterChange: [revalidatePost]` | WIRED | Line 38: `afterChange: [revalidatePost]` |
| `KnowledgeBase.ts` | `hooks/revalidateKB.ts` | `hooks.afterChange: [revalidateKB]` | WIRED | Line 37: `afterChange: [revalidateKB]` |

---

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| BLOG-06 (blog listing) | PARTIAL | Listing renders; noIndex filter missing from listing query |
| BLOG-07 (blog post page with rich text) | SATISFIED | RichText rendering, author bio, Article JSON-LD all present |
| BLOG-08 (blog pagination) | SATISFIED | Previous/Next controls using totalPages and page |
| KB-02 (help listing) | PARTIAL | Listing renders correctly; noIndex filter missing from KB listing query |
| KB-03 (section landing pages) | SATISFIED | /help/[section-slug] disambiguated via DB, SectionLanding component renders |
| KB-04 (breadcrumbs) | SATISFIED | Full breadcrumb nav: Home > Help > Section > Article |
| KB-05 (KB search) | SATISFIED | Search mode queries plugin-search 'search' collection; result slug resolved via doc.value |
| KB-06 (section grouping on /help) | SATISFIED | Sections fetched, articles grouped by section, empty sections skipped |
| KB-07 (FAQPage JSON-LD) | SATISFIED | FAQPage JSON-LD emitted conditionally on articleType=faq + faqs.length>0 |
| SEO-04 (XML sitemap) | SATISFIED | /sitemap.xml serves both collections with noIndex filter and CACHE_TAGS |
| SEO-05 (robots.txt) | SATISFIED | /admin disallowed, sitemap.xml linked |
| SEO-06 (Article JSON-LD) | SATISFIED | Article JSON-LD in blog post page with headline, author, dates, publisher |
| SEO-07 (HowTo JSON-LD) | SATISFIED | HowTo JSON-LD conditional on contentType=tutorial with steps[] array |
| SEO-08 (on-demand revalidation) | SATISFIED | afterChange hooks call revalidatePath + revalidateTag on publish and unpublish |

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `app/(marketing)/blog/page.tsx` | Missing `meta.noIndex` filter in listing query | Blocker | noIndex posts visible in public listing (violates success criterion 1) |
| `app/(marketing)/help/page.tsx` | Missing `meta.noIndex` filter in KB article queries (browse mode) | Blocker | noIndex KB articles visible in help listing and section groups |

No other anti-patterns. No TODOs, FIXMEs, empty implementations, or placeholder text found in any key file.

---

### Human Verification Required

#### 1. Blog Listing noIndex Exclusion
**Test:** Create and publish a blog post with "No Index" checked in the CMS SEO tab, then visit /blog
**Expected:** The post should NOT appear in the blog listing
**Why human:** Requires CMS interaction with a live database to test noIndex filtering behavior

#### 2. Tutorial Post HowTo JSON-LD
**Test:** Create a blog post with contentType=Tutorial, add at least one step, publish, then view page source at /blog/[slug]
**Expected:** Page source contains `"@type":"HowTo"` with a `"step"` array — not `"@type":"Article"`
**Why human:** Conditional JSON-LD schema depends on real post data with contentType=tutorial

#### 3. FAQPage JSON-LD on KB Articles
**Test:** Create a KB article with articleType=FAQ, add Q&A pairs, publish, then view page source at /help/[slug]
**Expected:** Page source contains `"@type":"FAQPage"` with `"mainEntity"` array of Question/Answer objects
**Why human:** Conditional on articleType=faq and faqs.length>0 — requires real CMS content

#### 4. Sitemap Reflects Published Content
**Test:** Publish a blog post and KB article, then visit /sitemap.xml
**Expected:** Both URLs appear in sitemap XML; if noIndex=true, the URL must be absent
**Why human:** Sitemap uses unstable_cache — requires server and real content to verify URL inclusion and noIndex exclusion

#### 5. On-Demand Revalidation
**Test:** Update the title of a published blog post in the admin panel, then immediately visit /blog/[slug]
**Expected:** The updated title appears without requiring a rebuild
**Why human:** Revalidation behavior requires running Next.js + Payload servers to observe

---

### Gaps Summary

One gap blocks full goal achievement:

**noIndex posts visible in public listings.** The ROADMAP success criterion 1 states "drafts and noIndex posts are not visible" at `/blog`. The blog listing page (`app/(marketing)/blog/page.tsx`) and the KB listing page (`app/(marketing)/help/page.tsx`) both query for published content but do not add the `meta.noIndex: { not_equals: true }` filter. This means a content editor could mark a post as noIndex (to exclude it from search engines and sitemaps) but the post would still appear in the public listing.

The fix is simple: add `{ 'meta.noIndex': { not_equals: true } }` to the `where.and` array in both queries.

Note: The sitemap (`app/sitemap.ts`) correctly filters noIndex content. The gap exists only in the listing pages.

All other success criteria are fully implemented with real, wired, substantive code — not stubs.

---

_Verified: 2026-02-19T00:05:00Z_
_Verifier: Claude (gsd-verifier)_
