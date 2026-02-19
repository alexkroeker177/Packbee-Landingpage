# Phase 4: Design & Styling - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Style the blog and knowledge base pages to match PackBee's brand and deliver a polished reading experience across all devices. The landing page's design system (warm amber palette, Plus Jakarta Sans headings, honeycomb textures, frosted-glass navbar, dark footer) is the reference. Blog/KB pages currently use raw Tailwind grays and have no navbar, footer, or brand styling.

</domain>

<decisions>
## Implementation Decisions

### Page chrome & navigation
- Use the same frosted-glass floating navbar from the landing page on all blog and KB pages — full brand consistency
- Use the same dark footer (5-column layout, newsletter form, honeycomb texture) on all blog and KB pages
- Page header treatment (branded header bar vs subtle breadcrumbs): Claude's discretion
- Cross-navigation between Blog and Help Center: Claude's discretion

### Content layout & cards
- Blog listing page: card-based layout with featured image thumbnails, title, excerpt, and metadata
- Blog post featured image treatment: Claude's discretion
- Author bio prominence: Claude's discretion
- Post page layout (single-column vs sidebar with TOC): Claude's discretion

### Brand intensity
- Honeycomb SVG textures: yes, subtle use on page headers or section dividers — brand consistency without distracting from reading
- Section backgrounds: use the warm amber/cream/honey backgrounds like the landing page — full brand immersion
- Scroll animations: none — static pages, no GSAP, focused on reading with zero JS overhead
- Color tokens: full adoption — convert all raw Tailwind grays (text-gray-600, etc.) to the CSS custom property system (--color-text-secondary, etc.) for palette switching support

### Help center experience
- Visual direction: warm & branded — same visual warmth as the blog, amber tones, cards, branded search bar. Feels like part of the marketing site, not a separate docs tool.
- KB section display on listing page: Claude's discretion (cards with icons or styled text groups)
- Search bar: hero-level prominence — large, prominent search bar at the top of the help page with a branded background, encourages self-service
- Help article vs blog post visual treatment: Claude's discretion (same reading experience or slightly more compact/utilitarian for reference material)

### Claude's Discretion
- Page header treatment (branded bar vs subtle breadcrumbs)
- Cross-navigation between Blog and Help Center
- Blog post featured image treatment (full-width hero vs contained)
- Author bio prominence (featured card vs subtle inline)
- Post page layout (single column vs sidebar with TOC)
- KB section display format (cards with icons vs styled text groups)
- Help article visual density vs blog post visual density

</decisions>

<specifics>
## Specific Ideas

- The existing landing page design tokens (palette "a" — Warm Golden Amber) are the reference: `--color-primary-*`, `--color-text-*`, `--color-surface-*`, `--color-section-*`
- Honeycomb texture (`bg-honeycomb` utility in globals.css) should be used subtly, not on every section
- The navbar component already exists in the landing page — reuse it, don't rebuild
- The footer component already exists — reuse it, don't rebuild
- `@tailwindcss/typography` prose classes are used on rich text bodies but may not be installed — verify during implementation
- The search button on the help page currently uses raw `bg-yellow-400` — must be converted to brand tokens

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-design-and-styling*
*Context gathered: 2026-02-19*
