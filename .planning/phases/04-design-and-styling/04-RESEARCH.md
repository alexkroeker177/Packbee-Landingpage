# Phase 4: Design & Styling - Research

**Researched:** 2026-02-19
**Domain:** Tailwind CSS v4 design system adoption, @tailwindcss/typography, Next.js layout patterns
**Confidence:** HIGH

## Summary

Phase 4 is a pure styling pass. The codebase already has a complete design system — CSS custom properties in `app/globals.css`, `bg-honeycomb` utility, and shared `Navbar`/`Footer` components in `components/`. The blog and KB pages at `app/(marketing)/blog/` and `app/(marketing)/help/` currently render correct data but have zero brand styling: raw Tailwind gray classes (`text-gray-600`, `border-b`), no navbar, no footer, and bare structural HTML.

The primary work falls into three categories: (1) install and configure `@tailwindcss/typography` to style Lexical-rendered rich text body content, (2) add `<Navbar>` and `<Footer>` to every page, and (3) replace raw gray classes with design tokens and build proper page-level layouts (hero header with honeycomb, card grid for blog listing, prominent search hero for help, sidebar TOC for post pages). No new data fetching or routing is needed — all routes and collections are complete.

**Primary recommendation:** Install `@tailwindcss/typography`, add it via `@plugin` in `globals.css`, create a custom `prose-amber` color override using `@utility` that maps `--tw-prose-*` variables to `--color-primary-*` and `--color-text-*` tokens, then style each page file in-place (no new route files needed).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tailwindcss/typography` | latest | Prose styling for Lexical-rendered rich text | Already referenced in blog/KB page components via `prose prose-lg` but not installed; required to render readable articles |
| Tailwind CSS v4 `@utility` | (built-in) | Custom utility for `prose-amber` color theme | Tailwind v4 CSS-first approach — no JS config needed |
| `clsx` + `tailwind-merge` | already installed | Class composition for conditional styling | Already in `lib/utils.ts` as `cn()` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | already installed | Icons for KB section cards, search icon, breadcrumb separators | Already installed; use `Search`, `ChevronRight`, `BookOpen`, `ArrowRight` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@tailwindcss/typography` | Hand-rolled prose CSS | Typography plugin handles 30+ edge cases (nested lists, code, blockquotes, tables); hand-rolling is weeks of work |
| Custom `prose-amber` via `@utility` | `prose-stone` built-in | Built-in stone clashes with amber brand; custom amber utility maps directly to `--color-primary-*` tokens |

**Installation:**
```bash
npm install -D @tailwindcss/typography
```

Then in `app/globals.css` (after the `@import "tailwindcss";` line):
```css
@plugin "@tailwindcss/typography";
```

## Architecture Patterns

### Recommended Project Structure

No new files needed for routes. New files needed:

```
components/
├── Navbar.tsx           # Already exists — reuse as-is
├── Footer.tsx           # Already exists — reuse as-is
├── BlogPageChrome.tsx   # NEW: wraps Navbar + main content slot + Footer for blog/help pages
└── (optional)
    └── ArticleTOC.tsx   # NEW: sticky TOC sidebar for long blog posts (optional, Claude's discretion)

app/(marketing)/
├── layout.tsx           # Existing root layout — no changes needed
├── blog/
│   ├── page.tsx         # Restyle: card grid, branded header, pagination
│   └── [slug]/
│       └── page.tsx     # Restyle: featured image hero, prose-amber, author card, optional TOC
└── help/
    ├── page.tsx         # Restyle: hero search bar, section cards, warm background
    └── [slug]/
        └── page.tsx     # Restyle: breadcrumbs, prose-amber, FAQ section, "back to section" nav
```

### Pattern 1: Shared Page Chrome (Navbar + Footer)

**What:** A thin wrapper component that renders Navbar above and Footer below, accepting `children` for the page body. All blog and KB pages import this instead of duplicating the Navbar/Footer import in every file.

**When to use:** Any page under `app/(marketing)/blog/` or `app/(marketing)/help/`

**Example:**
```tsx
// components/BlogPageChrome.tsx
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export function BlogPageChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[var(--color-section-a)]">
      <Navbar />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  )
}
```

The `pt-24` accounts for the fixed floating navbar height (64px nav + 24px top gap = 88px, round to pt-24 = 96px).

### Pattern 2: Prose-Amber Color Override

**What:** A custom Tailwind v4 `@utility` that maps `--tw-prose-*` variables to brand tokens, creating a `prose-amber` class that integrates with the palette system.

**When to use:** On the `<div>` wrapping any `<RichText>` component

**Example:**
```css
/* In app/globals.css, after @plugin "@tailwindcss/typography"; */

@utility prose-amber {
  --tw-prose-body: var(--color-text-primary);
  --tw-prose-headings: var(--color-text-primary);
  --tw-prose-lead: var(--color-text-secondary);
  --tw-prose-links: var(--color-primary-700);
  --tw-prose-bold: var(--color-text-primary);
  --tw-prose-counters: var(--color-text-secondary);
  --tw-prose-bullets: var(--color-primary-500);
  --tw-prose-hr: var(--color-border);
  --tw-prose-quotes: var(--color-text-secondary);
  --tw-prose-quote-borders: var(--color-primary-300);
  --tw-prose-captions: var(--color-text-muted);
  --tw-prose-code: var(--color-primary-800);
  --tw-prose-pre-code: var(--color-surface-50);
  --tw-prose-pre-bg: var(--color-cta-dark);
  --tw-prose-th-borders: var(--color-border);
  --tw-prose-td-borders: var(--color-border);
}
```

Usage: `<div className="prose prose-lg prose-amber max-w-none">`

### Pattern 3: Blog Listing Card Grid

**What:** Replace the current border-b list with a responsive card grid. Cards have featured image thumbnail, title, excerpt, author name, and date. Warm amber/cream card background, rounded corners, subtle shadow.

**When to use:** Blog listing page (`/blog`) — card-based layout is the locked decision.

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.docs.map((post) => (
    <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-shadow">
      {featuredImage?.url && (
        <img src={featuredImage.url} alt="" className="w-full h-48 object-cover" />
      )}
      <div className="p-5">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt && (
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 mb-4">{post.excerpt}</p>
        )}
        <div className="text-xs text-[var(--color-text-muted)] flex gap-2">
          {authorName && <span>{authorName}</span>}
          {formattedDate && <span>· {formattedDate}</span>}
        </div>
      </div>
    </article>
  ))}
</div>
```

### Pattern 4: Branded Page Header with Honeycomb

**What:** A section at the top of each listing page (blog, help) with branded background, honeycomb texture, page title, and optional subtitle. Used instead of a plain `<h1>`.

**When to use:** Blog listing page header, Help Center listing page header (where search hero lives)

**Example:**
```tsx
{/* Page header — branded amber background with honeycomb */}
<section className="relative bg-[var(--color-section-b)] bg-honeycomb overflow-hidden py-16 px-6">
  <div className="relative max-w-4xl mx-auto text-center">
    <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">Blog</h1>
    <p className="text-lg text-[var(--color-text-secondary)]">Insights and tutorials for e-commerce fulfillment</p>
  </div>
</section>
```

### Pattern 5: Help Center Search Hero

**What:** Hero-level search bar at the top of `/help`, with branded background (amber gradient), large input, and prominent submit button using brand tokens. The search button currently uses `bg-yellow-400` — replace with `bg-[var(--color-primary-500)]`.

**When to use:** Help listing page only

**Example:**
```tsx
<section className="relative bg-[var(--color-section-b)] bg-honeycomb py-16 px-6">
  <div className="max-w-2xl mx-auto text-center">
    <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-6">Help Center</h1>
    <form action="/help" method="GET" className="flex gap-2">
      <input
        type="text"
        name="q"
        placeholder="Search help articles..."
        className="flex-1 border border-[var(--color-border)] rounded-xl px-4 py-3 text-base bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
      />
      <button type="submit" className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-xl px-6 py-3 font-medium transition-colors">
        Search
      </button>
    </form>
  </div>
</section>
```

### Pattern 6: KB Section Cards

**What:** On the Help listing page, show each section as a card with icon, title, description, and article count. Cards use cream/honey background (`--color-surface-50` or `--color-section-d`).

**When to use:** Browse mode of `/help` — this is the Claude's-discretion format; cards-with-icons recommended over plain text groups because they match the landing page's visual density.

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {sectionsWithArticles.map(({ section, articles }) => (
    <Link key={section.id} href={`/help/${section.slug}`}
      className="bg-[var(--color-surface-50)] border border-[var(--color-border)] rounded-2xl p-6 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{section.title}</h2>
      {section.description && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-3">{section.description}</p>
      )}
      <span className="text-xs text-[var(--color-text-muted)]">{articles.length} articles</span>
    </Link>
  ))}
</div>
```

### Pattern 7: Blog Post Layout — Single Column with Optional Sticky TOC

**What:** For Claude's discretion on post layout — recommend a two-column approach on desktop: main content (prose) at ~65% width, sticky TOC sidebar at ~35% on `lg:` breakpoint. Mobile collapses to single column with TOC hidden or moved inline above the article.

The TOC requires extracting headings from the Lexical content. However, the Lexical `RichText` component renders server-side as HTML — extracting headings from the rich text JSON to build a TOC requires iterating the Lexical node tree (not trivial). **Recommendation:** Skip TOC for now as "static pages, no JS overhead" is a stated goal, and a static TOC from Lexical JSON requires JSON traversal at the page level. Instead, use a clean single-column layout at `max-w-2xl mx-auto` for optimal reading line length (65-75 characters).

**Post layout recommendation:**
```tsx
<article className="max-w-2xl mx-auto px-4 py-12">
  {/* Featured image — full-width contained with rounded corners */}
  {featuredImage?.url && (
    <div className="mb-8 rounded-2xl overflow-hidden">
      <img src={featuredImage.url} alt={featuredImage.alt ?? ''} className="w-full h-64 md:h-96 object-cover" />
    </div>
  )}
  <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">{post.title}</h1>
  <div className="flex gap-3 text-sm text-[var(--color-text-muted)] mb-8 pb-8 border-b border-[var(--color-border)]">
    {author && <span>{author.name}</span>}
    {formattedDate && <span>· {formattedDate}</span>}
  </div>
  <div className="prose prose-lg prose-amber max-w-none">
    <RichText data={post.body} />
  </div>
</article>
```

**Author bio — featured card (recommended over subtle inline):**
```tsx
{author && (
  <div className="mt-12 p-6 bg-[var(--color-section-d)] rounded-2xl border border-[var(--color-border)] flex gap-4 items-start">
    {authorAvatar?.url && (
      <img src={authorAvatar.url} alt={author.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
    )}
    <div>
      <strong className="block text-base font-semibold text-[var(--color-text-primary)]">{author.name}</strong>
      {author.role && <span className="text-sm text-[var(--color-text-secondary)]">{author.role}</span>}
      {author.bio && <p className="text-sm text-[var(--color-text-secondary)] mt-1">{author.bio}</p>}
    </div>
  </div>
)}
```

### Pattern 8: Styled Breadcrumbs

**What:** Replace plain `text-gray-500` breadcrumbs with brand tokens. Use a chevron separator (`›` or lucide `ChevronRight`) instead of plain `/`.

**Example:**
```tsx
<nav aria-label="breadcrumb" className="mb-8">
  <ol className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
    <li><Link href="/" className="hover:text-[var(--color-primary-700)] transition-colors">Home</Link></li>
    <li><ChevronRight size={14} className="text-[var(--color-text-muted)]" /></li>
    <li><Link href="/help" className="hover:text-[var(--color-primary-700)] transition-colors">Help</Link></li>
    <li><ChevronRight size={14} className="text-[var(--color-text-muted)]" /></li>
    <li className="text-[var(--color-text-primary)] font-medium" aria-current="page">{section.title}</li>
  </ol>
</nav>
```

### Anti-Patterns to Avoid

- **Using `text-gray-*` classes anywhere on blog/KB pages:** They bypass the CSS custom property system and break palette switching. Always use `text-[var(--color-text-primary)]`, `text-[var(--color-text-secondary)]`, or `text-[var(--color-text-muted)]`.
- **Rebuilding Navbar or Footer:** The components in `components/Navbar.tsx` and `components/Footer.tsx` are already complete. Import them directly.
- **Adding scroll animations (GSAP):** The locked decision is "static pages, no GSAP, no JS overhead." Only CSS transitions (`transition-colors`, `transition-shadow`) are acceptable.
- **Adding `max-w-none` without `prose-amber`:** The prose classes' default text color will be a hard gray, not the brand tokens. Always pair `prose` with `prose-amber`.
- **Nesting page-level containers inside BlogPageChrome AND inside the page:** Double-wrapping creates layout issues. BlogPageChrome handles the outer shell; page components handle inner max-width containers.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text styling | Custom CSS for h1-h6, p, blockquote, code, ul, ol, table | `prose prose-lg prose-amber` | Typography plugin handles 30+ element types, spacing ratios, nested content, and dark mode |
| Icon set | Custom SVGs for search, chevron, arrow | `lucide-react` (already installed) | Already in project; consistent stroke weights |
| Color token mapping | Separate theme file or JSON | CSS custom properties in `globals.css` | Already in place; extend with `prose-amber` utility |

**Key insight:** The design system is already complete. Phase 4 is applying it to new pages, not building new systems.

## Common Pitfalls

### Pitfall 1: @tailwindcss/typography Not Working with v4

**What goes wrong:** The `prose` class has no effect, or CSS is missing entirely.
**Why it happens:** In Tailwind v4, plugins must be declared with `@plugin` directive in the CSS file, NOT in a `tailwind.config.js`. The old `plugins: [require('@tailwindcss/typography')]` pattern is a v3 pattern.
**How to avoid:** In `app/globals.css`, add `@plugin "@tailwindcss/typography";` immediately after `@import "tailwindcss";`.
**Warning signs:** `prose` class visible in DOM but no typographic changes applied.

### Pitfall 2: Navbar Overlap with Page Content

**What goes wrong:** Page content appears underneath the fixed floating navbar.
**Why it happens:** The Navbar renders with `fixed top-6` positioning, so it's out of document flow. Pages must add top padding equal to navbar height + gap.
**How to avoid:** The `BlogPageChrome` wrapper should use `pt-24` on `<main>` (= 96px, covers 64px nav + 24px top gap + buffer). Verify visually at both mobile and desktop breakpoints.
**Warning signs:** The first section heading appears clipped by the navbar on mobile.

### Pitfall 3: Raw Color Classes Surviving Gray Hunt

**What goes wrong:** Token-replacement pass misses some gray classes, leaving inconsistent coloring.
**Why it happens:** Gray classes (`text-gray-400`, `text-gray-500`, `text-gray-600`, `text-gray-700`, `hover:bg-gray-50`, `border-b`) are scattered across both listing and detail pages.
**How to avoid:** After styling, do a final grep: `grep -r "gray-\|yellow-400\|yellow-500" app/(marketing)/blog app/(marketing)/help`. Expect zero matches when done.
**Warning signs:** Any match on the grep above.

### Pitfall 4: Honeycomb Texture Overuse

**What goes wrong:** Using `bg-honeycomb` on every section creates visual noise and competes with content readability.
**Why it happens:** The texture is visually distinctive and tempting to apply broadly.
**How to avoid:** Use `bg-honeycomb` only on page hero headers (blog listing header, help center search hero). Use `opacity-[0.06]` or similar low opacity. Never on reading areas (prose content, card grids).
**Warning signs:** Any `bg-honeycomb` applied to a `prose` container or article body wrapper.

### Pitfall 5: @utility prose-amber Placement

**What goes wrong:** The `prose-amber` utility is defined but doesn't apply inside `prose` context, or it conflicts with other prose color modifiers.
**Why it happens:** The `@utility` directive creates a standalone utility class, but `--tw-prose-*` variables must be set in the same scope as `prose` for the cascade to work correctly.
**How to avoid:** The `@utility prose-amber` block in `globals.css` sets CSS variables that the `prose` class reads. Apply both classes together: `class="prose prose-lg prose-amber max-w-none"`. Never use `prose-stone` or other prose color modifiers alongside `prose-amber` — they'll conflict.

### Pitfall 6: BlogPageChrome as Server vs Client Component

**What goes wrong:** `BlogPageChrome` is marked `"use client"` and causes Payload server data to not stream through correctly, or conversely, it's a server component but Navbar requires `"use client"`.
**Why it happens:** `Navbar.tsx` is `"use client"` (it uses `useState`/`useEffect`). Components that import client components can themselves be server components — Next.js handles the boundary correctly.
**How to avoid:** `BlogPageChrome` does NOT need `"use client"`. It's a plain server-renderable wrapper that imports a client-component Navbar. This is the standard Next.js pattern and works correctly.

## Code Examples

Verified patterns from codebase inspection:

### Installing Typography Plugin in globals.css
```css
/* app/globals.css — existing lines at top */
@import "tailwindcss";
@plugin "@tailwindcss/typography";  /* ADD THIS LINE */

/* ... rest of existing CSS ... */

/* ADD THIS UTILITY after existing @theme block */
@utility prose-amber {
  --tw-prose-body: var(--color-text-primary);
  --tw-prose-headings: var(--color-text-primary);
  --tw-prose-lead: var(--color-text-secondary);
  --tw-prose-links: var(--color-primary-700);
  --tw-prose-bold: var(--color-text-primary);
  --tw-prose-counters: var(--color-text-secondary);
  --tw-prose-bullets: var(--color-primary-500);
  --tw-prose-hr: var(--color-border);
  --tw-prose-quotes: var(--color-text-secondary);
  --tw-prose-quote-borders: var(--color-primary-300);
  --tw-prose-captions: var(--color-text-muted);
  --tw-prose-code: var(--color-primary-800);
  --tw-prose-pre-code: var(--color-surface-50);
  --tw-prose-pre-bg: var(--color-cta-dark);
  --tw-prose-th-borders: var(--color-border);
  --tw-prose-td-borders: var(--color-border);
}
```

### Raw Gray to Token Mapping Reference

| Old Class | New Class |
|-----------|-----------|
| `text-gray-400` | `text-[var(--color-text-muted)]` |
| `text-gray-500` | `text-[var(--color-text-muted)]` |
| `text-gray-600` | `text-[var(--color-text-secondary)]` |
| `text-gray-700` | `text-[var(--color-text-secondary)]` |
| `hover:text-gray-700` | `hover:text-[var(--color-text-primary)]` |
| `hover:bg-gray-50` | `hover:bg-[var(--color-surface-50)]` |
| `border-b` (bare) | `border-b border-[var(--color-border)]` |
| `bg-yellow-400` | `bg-[var(--color-primary-500)]` |
| `hover:bg-yellow-500` | `hover:bg-[var(--color-primary-600)]` |

### Cross-Navigation Pattern (Claude's Discretion Recommendation)

A small cross-nav bar between Blog and Help, placed below the page hero header:

```tsx
<div className="border-b border-[var(--color-border)] bg-white">
  <div className="max-w-4xl mx-auto px-6 flex gap-6">
    <Link href="/blog" className="py-3 text-sm font-medium border-b-2 border-[var(--color-primary-500)] text-[var(--color-text-primary)]">
      Blog
    </Link>
    <Link href="/help" className="py-3 text-sm font-medium border-b-2 border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
      Help Center
    </Link>
  </div>
</div>
```

Active state: the current section gets `border-b-2 border-[var(--color-primary-500)]` and full text color. Inactive gets `border-transparent` and muted text.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` plugin array | `@plugin` directive in CSS | Tailwind v4 (2025) | No JS config needed; plugins declared in CSS |
| `require('@tailwindcss/typography')` | `@plugin "@tailwindcss/typography"` | Tailwind v4 | Breaking change from v3 |
| `theme.extend.typography` for color customization | `@utility prose-amber` with CSS vars | Tailwind v4 | JS config deprecated; CSS-first |

**Deprecated/outdated:**
- `tailwind.config.js` plugin registration: Not needed in v4; `@plugin` directive in CSS replaces it entirely.

## Open Questions

1. **Whether `@tailwindcss/typography` has a peer-dependency constraint with the installed Tailwind v4 version**
   - What we know: The project uses Tailwind v4 (`"tailwindcss": "^4"` in devDependencies). Typography plugin added explicit v4 support in recent releases.
   - What's unclear: Whether the current latest `@tailwindcss/typography` requires a minimum Tailwind v4 patch version.
   - Recommendation: Run `npm install -D @tailwindcss/typography` and check for peer dependency warnings. If warnings appear, pin to the compatible version.

2. **Whether Lexical RichText renders valid HTML that prose classes can target**
   - What we know: `<RichText data={post.body} />` from `@payloadcms/richtext-lexical/react` renders standard HTML headings, paragraphs, and lists.
   - What's unclear: Whether it wraps output in a container div that could block prose cascade, or whether it renders naked HTML elements.
   - Recommendation: After adding `prose prose-lg prose-amber`, visually verify heading hierarchy, blockquotes, and code blocks render correctly. If cascade is blocked, add `[&_*]:text-inherit` or inspect the rendered DOM.

3. **Whether the Navbar `href="#"` placeholder links need updating for blog/help context**
   - What we know: Navbar has `href="#funktionen"` (anchor to landing page section), "Ressourcen", and "Preise" links that hash-link to the landing page.
   - What's unclear: Whether these should point to actual routes (`/blog`, `/help`, `/`) when rendered on non-landing pages.
   - Recommendation: Update Navbar hrefs as part of this phase. At minimum, the logo should link to `/` (not `#`), and "Ressourcen" should link to `/blog`. This is a minor change that makes the shared Navbar usable across pages.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `app/globals.css` — full CSS custom property system documented
- Codebase inspection: `components/Navbar.tsx`, `components/Footer.tsx` — component structure confirmed
- Codebase inspection: `app/(marketing)/blog/page.tsx`, `[slug]/page.tsx`, `help/page.tsx`, `help/[slug]/page.tsx` — current raw styling confirmed
- Codebase inspection: `package.json` — confirmed `@tailwindcss/typography` NOT installed
- [tailwindlabs/tailwindcss-typography GitHub](https://github.com/tailwindlabs/tailwindcss-typography) — v4 `@plugin` installation and `--tw-prose-*` CSS variables confirmed

### Secondary (MEDIUM confidence)
- [Tailwind CSS Typography Discussion #14120](https://github.com/tailwindlabs/tailwindcss/discussions/14120) — v4 prose behavior changes
- [Tailwind CSS Typography Discussion #15670](https://github.com/tailwindlabs/tailwindcss/discussions/15670) — customization patterns in v4

### Tertiary (LOW confidence)
- WebSearch: Sticky TOC sidebar pattern for Next.js blog — not verified with official docs; recommended simpler single-column layout instead

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified by codebase inspection and official GitHub docs
- Architecture: HIGH — patterns derived directly from existing component structure
- Pitfalls: HIGH for items 1-4 (derived from codebase facts); MEDIUM for items 5-6 (based on Next.js docs knowledge)

**Research date:** 2026-02-19
**Valid until:** 2026-03-21 (stable domain; Tailwind v4 API unlikely to change)
