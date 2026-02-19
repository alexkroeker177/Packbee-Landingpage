---
phase: 04
plan: 01
name: typography-plugin-and-page-chrome
subsystem: design-system
tags: [tailwindcss, typography, prose, css-utilities, layout, components]

dependency-graph:
  requires: [03-frontend-and-seo]
  provides: [prose-amber utility, BlogPageChrome wrapper]
  affects: [04-02-blog-page-styling, 04-03-help-page-styling]

tech-stack:
  added: ["@tailwindcss/typography@0.5.19"]
  patterns: ["Tailwind v4 CSS-first @plugin directive", "@utility custom prose variant", "Server component wrapping client components"]

key-files:
  created: ["components/BlogPageChrome.tsx"]
  modified: ["app/globals.css", "package.json", "package-lock.json"]

decisions:
  - id: use-legacy-peer-deps
    choice: "npm install --legacy-peer-deps for @tailwindcss/typography"
    reason: "Existing Payload CMS 3.77.0 has strict next peer dep requirements that conflict with next@16.1.6; legacy-peer-deps is the established pattern for this project"
  - id: prose-amber-as-utility
    choice: "@utility prose-amber with CSS custom property overrides"
    reason: "Tailwind v4 uses @utility for custom utilities; prose-amber sets all 16 --tw-prose-* variables to brand tokens so any element using prose + prose-amber gets fully branded typography"
  - id: blogpagechrome-server-component
    choice: "Server component (no 'use client') importing Navbar and Footer"
    reason: "Next.js handles the client boundary at import: Navbar and Footer declare 'use client' themselves. BlogPageChrome stays server-rendered for better performance."

metrics:
  duration: "8 min"
  completed: "2026-02-19"
  tasks-completed: 2
  tasks-total: 2
---

# Phase 4 Plan 1: Typography Plugin and Page Chrome Summary

**One-liner:** @tailwindcss/typography installed with prose-amber brand utility, and BlogPageChrome server component providing Navbar+Footer shell for blog and help pages.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install typography plugin and add prose-amber utility | b8cb7ba | app/globals.css, package.json, package-lock.json |
| 2 | Create BlogPageChrome wrapper component | a5fa2a3 | components/BlogPageChrome.tsx |

## What Was Built

### @tailwindcss/typography Plugin

Installed `@tailwindcss/typography@0.5.19` as a dev dependency and registered it via the Tailwind v4 CSS-first `@plugin "@tailwindcss/typography";` directive immediately after `@import "tailwindcss";` in `app/globals.css`.

### prose-amber Custom Utility

Added `@utility prose-amber` block after the `@theme` block with all 16 `--tw-prose-*` CSS variables mapped to brand tokens:

- Body and heading text: `--color-text-primary`
- Links: `--color-primary-700` (rich amber)
- Bullets: `--color-primary-500`
- Code blocks: dark background (`--color-cta-dark`) with light text (`--color-surface-50`)
- Borders: `--color-border`

Pages can now use `className="prose prose-amber"` to get fully branded Lexical rich text rendering.

### BlogPageChrome Component

Created `components/BlogPageChrome.tsx` as a Next.js server component that provides consistent page chrome:

```tsx
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

Key design decisions:
- `pt-24` (96px) clears the fixed floating navbar (64px height + 24px top gap + buffer)
- `min-h-screen` pushes footer to bottom on short pages
- `overflow-x-hidden` prevents horizontal scrollbar from decorative elements
- `bg-[var(--color-section-a)]` applies the warm cream background from the active palette

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| npm install flag | `--legacy-peer-deps` | Payload CMS peer dep conflict is pre-existing; legacy mode is established project pattern |
| prose-amber implementation | `@utility` with CSS var overrides | Tailwind v4 pattern; all 16 `--tw-prose-*` vars mapped to brand tokens for full control |
| BlogPageChrome boundary | Server component | Client boundary handled by Navbar/Footer internally; server wrapper is more efficient |

## Verification

All success criteria met:

- `grep '@plugin "@tailwindcss/typography"' app/globals.css` — matches
- `grep '@utility prose-amber' app/globals.css` — matches
- `npm ls @tailwindcss/typography` — shows `@tailwindcss/typography@0.5.19`
- `components/BlogPageChrome.tsx` — exists, no "use client", imports Navbar and Footer
- `npm run build` — passes cleanly with all 9 routes generated

## Deviations from Plan

**1. [Rule 3 - Blocking] npm install required --legacy-peer-deps flag**

- **Found during:** Task 1
- **Issue:** `npm install -D @tailwindcss/typography` fails with ERESOLVE due to Payload CMS 3.77.0 strict next peer dep constraints conflicting with next@16.1.6
- **Fix:** Used `npm install -D @tailwindcss/typography --legacy-peer-deps` which resolves cleanly
- **Files modified:** package.json, package-lock.json
- **Commit:** b8cb7ba

No other deviations — plan executed as written.

## Next Phase Readiness

Plans 04-02 (blog styling) and 04-03 (help styling) can now import `BlogPageChrome` and apply `prose prose-amber` typography classes to Lexical rich text content.
