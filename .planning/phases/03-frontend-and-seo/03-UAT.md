---
status: cancelled
phase: 03-frontend-and-seo
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md
started: 2026-02-19T00:10:00Z
updated: 2026-02-19T00:10:00Z
---

## Current Test

number: 1
name: Existing Landing Page Intact
expected: |
  Visit / — the existing PackBee landing page renders with all content and GSAP animations intact. No visual regressions, no CSS bleed from CMS styles.
awaiting: [cancelled — user chose to proceed to styling phase]

## Tests

### 1. Existing Landing Page Intact
expected: Visit / — the existing PackBee landing page renders with all content and GSAP animations intact. No visual regressions.
result: [pending]

### 2. Blog Listing Page
expected: Visit /blog — shows a list of published blog posts with title, excerpt, author name, publish date, and featured image. Drafts should NOT appear. Pagination controls visible if more than 10 posts exist.
result: [pending]

### 3. Individual Blog Post Page
expected: Visit /blog/[slug] for a published post — full rich text body renders, author bio section shows below the post (name, role, bio, avatar).
result: [pending]

### 4. Blog Post Article JSON-LD
expected: View page source on /blog/[slug] for a standard (non-tutorial) post — page source contains a script tag with application/ld+json containing "@type":"Article" with headline, author, datePublished, and publisher fields.
result: [pending]

### 5. Tutorial Post HowTo JSON-LD
expected: Create a blog post with contentType=Tutorial, add at least one step, publish — view page source at /blog/[slug] contains "@type":"HowTo" with a "step" array (NOT "@type":"Article").
result: [pending]

### 6. Help Center Listing
expected: Visit /help — KB articles appear grouped by section headers. Each section shows its title and description. Only sections with published articles are visible.
result: [pending]

### 7. Help Center Search
expected: On /help, type a search term and submit — results appear filtered by that term. Clicking a result navigates to the article page.
result: [pending]

### 8. Section Landing Page
expected: Click a section title on /help — navigates to /help/[section-slug] showing a section landing page with breadcrumbs (Home > Help > Section) and a list of articles in that section.
result: [pending]

### 9. KB Article Page with Breadcrumbs
expected: Visit /help/[article-slug] for a published KB article — full rich text body renders with breadcrumb navigation (Home > Help > Section > Article Title).
result: [pending]

### 10. FAQ Article FAQPage JSON-LD
expected: Create a KB article with articleType=FAQ, add Q&A pairs, publish — view page source at /help/[slug] contains "@type":"FAQPage" with "mainEntity" array of Question/Answer objects. FAQ pairs also visible on the page itself.
result: [pending]

### 11. XML Sitemap
expected: Visit /sitemap.xml — contains URLs for /blog/[slug] posts and /help/[slug] articles that are published and not marked noIndex. Static pages (/, /blog, /help) also present.
result: [pending]

### 12. Robots.txt
expected: Visit /robots.txt — shows "Disallow: /admin" and a link to /sitemap.xml.
result: [pending]

### 13. noIndex Exclusion from Listings
expected: Publish a blog post with "No Index" checked in SEO tab — the post should NOT appear in the /blog listing and should NOT appear in /sitemap.xml.
result: [pending]

### 14. On-Demand Revalidation
expected: Update the title of a published blog post in the admin panel — visit /blog/[slug] and the updated title appears without a full rebuild.
result: [pending]

## Summary

total: 14
passed: 0
issues: 0
pending: 14
skipped: 0

## Gaps
