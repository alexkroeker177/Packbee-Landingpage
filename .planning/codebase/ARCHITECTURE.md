# Architecture

**Analysis Date:** 2026-02-18

## Pattern Overview

**Overall:** Next.js App Router with scroll-triggered animations and interactive component showcase pattern

**Key Characteristics:**
- Landing page structured as vertically-scrolling sections with progressive reveals
- Heavy use of GSAP scroll animations (ScrollTrigger) for hero, features, and UI interactions
- Modular component hierarchy with isolated feature showcases
- Design token system with 3 switchable color palettes (Palette A/B/C)
- Interactive prototype demonstrations embedded in page flow

## Layers

**Presentation Layer:**
- Purpose: React components rendering UI, animations, and interactions
- Location: `components/`, `app/page.tsx`
- Contains: Section components, feature cards, interactive prototypes, UI elements
- Depends on: Animation frameworks (GSAP, Framer Motion), utility functions, types
- Used by: Page routing layer

**Layout/Routing Layer:**
- Purpose: Next.js App Router structure and root template
- Location: `app/layout.tsx`, `app/page.tsx`
- Contains: Metadata, font registration, root template, page composition
- Depends on: Global styles, component library
- Used by: Next.js runtime

**Animation & Motion Layer:**
- Purpose: Scroll-triggered animations, 3D transforms, morphing effects
- Location: Throughout components (GSAP ScrollTrigger, Framer Motion)
- Contains: Timeline orchestrations, scroll bindings, spring animations, transform operations
- Depends on: GSAP library with ScrollTrigger plugin, Framer Motion
- Used by: Hero, Feature sections, Carousel

**Utilities & Helpers:**
- Purpose: Shared functions and type definitions
- Location: `lib/utils.ts`, `hooks/`, component type files
- Contains: Class merging (`cn`), CSS variable reader (`getCSSVar`), media query hook, demo data
- Depends on: clsx, tailwind-merge, React hooks
- Used by: All components

**Styling & Design Tokens:**
- Purpose: Global styles, color palettes, typography, animations
- Location: `app/globals.css`
- Contains: CSS custom properties, Tailwind v4 theme registration, keyframe animations
- Depends on: Tailwind CSS v4
- Used by: All components via class names and CSS variables

## Data Flow

**Page Load Flow:**

1. User visits landing page
2. `app/layout.tsx` loads root layout with fonts and global styles
3. `app/page.tsx` renders Hero, then cascading sections
4. Components mount in sequence: Navbar → Hero → ScrollHeading → FeatureCarousel → FeaturesCreative → FeatureShowcase → Testimonials → Footer
5. GSAP ScrollTrigger activates on mount and binds animations to scroll events
6. As user scrolls, animations trigger based on scroll position and element viewport visibility

**State Management:**
- Component-local state only (React `useState`)
- Interactive prototype maintains local state for scan simulation, address editing, printer selection
- No global state management (Redux, Zustand, Context)
- Animations driven by scroll position (not state)

## Key Abstractions

**Feature Card System:**
- Purpose: Reusable pattern for displaying feature cards with title, description, visual component, and animated blobs
- Examples: `components/FeaturesCreative.tsx`, `components/FeatureShowcase.tsx`
- Pattern: Array of feature objects → mapped to JSX, each with independent GSAP animation context

**Interactive Prototype Component:**
- Purpose: Self-contained mock app demonstrating packing workflow
- Examples: `components/packing-prototype/PackingPrototype.tsx` (orchestrator)
- Pattern: Single state container managing item scanning, address editing, finalization, with sub-components (Sidebar, OrderInfoPanel, PickListPanel, PrototypeHeader)

**3D Carousel:**
- Purpose: Animated feature carousel using Framer Motion spring physics
- Examples: `components/floating-3d-carousel/CardCarousel.tsx`, `components/floating-3d-carousel/FeatureCarouselSection.tsx`
- Pattern: Motion values + useTransform for card rotation, opacity, z-index based on active index; auto-turn on interval

**Visual Feature Components:**
- Purpose: Standalone SVG/canvas animations for feature demonstrations
- Examples: `components/features/ScanVerifyVisual.tsx`, `components/features/MultiPackerVisual.tsx`, `components/features/NoScanNoLabelVisual.tsx`
- Pattern: Lightweight React components wrapping animated SVG elements

## Entry Points

**Root Page:**
- Location: `app/page.tsx`
- Triggers: Browser navigation to `/`
- Responsibilities: Compose entire landing page from section components, orchestrate scroll flow

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Application initialization
- Responsibilities: Load fonts (Inter, Plus Jakarta Sans), register metadata, wrap page in HTML/body tags, apply global styles

**Section Components (Parallel Entry Points):**
- Navbar (`components/Navbar.tsx`): Fixed header with logo, nav links, mobile menu
- Hero (`components/Hero.tsx`): Full-screen intro with scroll-driven split layout animation
- ScrollHeading (`components/ScrollHeading.tsx`): Animated section transition
- FeatureCarouselSection (`components/floating-3d-carousel/FeatureCarouselSection.tsx`): 3D carousel showcase
- FeaturesCreative (`components/FeaturesCreative.tsx`): Three feature cards with blob animations
- FeatureShowcase (`components/FeatureShowcase.tsx`): Two-column feature layout with staggered reveals
- Testimonials (`components/Testimonials.tsx`): Testimonial cards with scroll reveals
- Footer (`components/Footer.tsx`): Page footer

## Error Handling

**Strategy:** Defensive rendering with fallbacks

**Patterns:**
- Image loading: Use `Image` from Next.js with `onError` fallback (where used)
- Missing CSS vars: `getCSSVar()` in `lib/utils.ts` returns empty string if window undefined (SSR safety)
- Animation context: GSAP contexts wrapped in `useLayoutEffect` with cleanup `ctx.revert()`
- Type safety: TypeScript interfaces for all data structures (Feature, CarouselFeature, DemoOrder, etc.)

## Cross-Cutting Concerns

**Logging:** Not implemented (landing page only, no backend integration)

**Validation:** Input validation in prototype address dialog (basic required field checks)

**Authentication:** Not applicable (public landing page)

**Responsive Design:**
- Tailwind breakpoints used throughout (sm, md, lg, xl, 2xl)
- `useMediaQuery` hook (`hooks/useMediaQuery.ts`) for runtime breakpoint detection
- GSAP ScrollTrigger `matchMedia` in Hero for split desktop vs. stacked mobile layout
- Mobile-first CSS approach with `hidden` / `md:flex` patterns

**Performance Considerations:**
- GSAP animations use `scrub` for scroll-linked performance (GPU-accelerated transforms)
- Framer Motion spring physics for carousel (smooth, performant)
- Image lazy loading via Next.js Image component
- No unused libraries; all dependencies actively used

---

*Architecture analysis: 2026-02-18*
