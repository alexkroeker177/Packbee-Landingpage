# Codebase Structure

**Analysis Date:** 2026-02-18

## Directory Layout

```
packbee-landingpage/
├── app/                           # Next.js App Router directory
│   ├── layout.tsx                 # Root layout with fonts and metadata
│   ├── page.tsx                   # Home page (section composition)
│   └── globals.css                # Global styles with design tokens
├── components/                    # React components
│   ├── Navbar.tsx                 # Fixed navigation header
│   ├── Hero.tsx                   # Full-screen hero with scroll animation
│   ├── ScrollHeading.tsx          # Section transition component
│   ├── FeatureShowcase.tsx        # Two-column feature layout
│   ├── FeaturesCreative.tsx       # Three-card creative feature section
│   ├── Testimonials.tsx           # Testimonials carousel
│   ├── Footer.tsx                 # Page footer
│   ├── AppWindow.tsx              # Mock app window for prototype display
│   ├── ChatWidget.tsx             # Chat UI component (demo)
│   ├── FloatingNotification.tsx   # Toast/notification component
│   ├── features/                  # Feature visual components
│   │   ├── ScanVerifyVisual.tsx   # Barcode scan animation
│   │   ├── NoScanNoLabelVisual.tsx # Locked label visualization
│   │   └── MultiPackerVisual.tsx  # Multi-user packing visualization
│   ├── floating-3d-carousel/      # 3D carousel section
│   │   ├── CardCarousel.tsx       # Main carousel with spring physics
│   │   ├── FeatureCarouselSection.tsx # Carousel layout wrapper
│   │   └── types.ts               # CarouselFeature type
│   └── packing-prototype/         # Interactive packing prototype
│       ├── PackingPrototype.tsx   # Main orchestrator component
│       ├── Sidebar.tsx            # Left sidebar with order list
│       ├── PrototypeHeader.tsx    # Header bar
│       ├── PickListPanel.tsx      # Pick list display
│       ├── OrderInfoPanel.tsx     # Order details panel
│       ├── ProgressBar.tsx        # Progress indicator
│       ├── AddressEditDialog.tsx  # Modal for address editing
│       ├── demo-data.ts           # Mock order data
│       └── types.ts               # DemoProduct, DemoOrder, ScanState types
├── hooks/                         # Custom React hooks
│   ├── useMediaQuery.ts           # Breakpoint detection hook
│   └── useInterval.ts             # Interval management hook
├── lib/                           # Utility functions
│   └── utils.ts                   # cn() class merger, getCSSVar() CSS reader
├── public/                        # Static assets
│   └── images/                    # Image files (logos, screenshots, favicons)
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── postcss.config.mjs             # PostCSS configuration (Tailwind)
└── .planning/
    └── codebase/                  # Planning documents (this directory)
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router root with layout, page, and global styles
- Contains: Route definitions, root template, metadata, CSS variables
- Key files: `layout.tsx` (root wrapper), `page.tsx` (home page), `globals.css` (design tokens)

**`components/`:**
- Purpose: All React components organized by section/feature
- Contains: Section components (Hero, Features, Testimonials), sub-components, interactive prototypes
- Key files: `Navbar.tsx` (header), `Hero.tsx` (scroll orchestrator), `FeaturesCreative.tsx` (cards with blobs)

**`components/features/`:**
- Purpose: Self-contained visual demonstrations of core features
- Contains: SVG/canvas-based animations for scan verification, label locking, multi-packer views
- Key files: `ScanVerifyVisual.tsx`, `NoScanNoLabelVisual.tsx`, `MultiPackerVisual.tsx`

**`components/floating-3d-carousel/`:**
- Purpose: 3D rotating carousel showcasing features
- Contains: Card carousel with Framer Motion spring physics, section wrapper
- Key files: `CardCarousel.tsx` (animation logic), `FeatureCarouselSection.tsx` (layout), `types.ts` (CarouselFeature)

**`components/packing-prototype/`:**
- Purpose: Interactive mock app demonstrating PackBee's packing workflow
- Contains: Stateful prototype container, UI panels, demo data
- Key files: `PackingPrototype.tsx` (state management), `demo-data.ts` (mock orders), `types.ts` (data structures)

**`hooks/`:**
- Purpose: Reusable React hooks for common patterns
- Contains: Media query detection, interval timers
- Key files: `useMediaQuery.ts` (breakpoint detection), `useInterval.ts` (cleanup-safe interval)

**`lib/`:**
- Purpose: Utility functions and helpers
- Contains: Class name utilities, CSS variable readers
- Key files: `utils.ts` (cn for Tailwind+clsx merging, getCSSVar for runtime CSS access)

**`public/`:**
- Purpose: Static assets served by Next.js
- Contains: Images (SVG logos, PNG screenshots, favicons)
- Key files: `images/Packbee-Logo-Full-Black.svg`, `images/Packbee-Logo-Full-White.svg`, `images/packbee-favicon.svg`

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Main landing page; imports and composes all sections
- `app/layout.tsx`: Root template with font loading and metadata

**Configuration:**
- `tsconfig.json`: TypeScript compiler options (target ES2017, strict mode enabled, path aliases @/*)
- `next.config.ts`: Next.js config with remote image patterns (unsplash, picsum, ui-avatars)
- `postcss.config.mjs`: PostCSS setup for Tailwind v4
- `package.json`: Dependencies (Next.js, React 19, GSAP, Framer Motion, Tailwind, lucide-react)

**Core Logic:**
- `components/Hero.tsx`: Scroll-driven animation orchestration with GSAP (hero text, app window, left content)
- `components/floating-3d-carousel/CardCarousel.tsx`: Framer Motion spring physics, card transform calculations
- `components/packing-prototype/PackingPrototype.tsx`: State container for interactive prototype
- `components/FeaturesCreative.tsx`: Blob morph animations and card reveal pattern

**Testing:**
- Not detected (no test files in codebase)

## Naming Conventions

**Files:**
- PascalCase for component files: `Navbar.tsx`, `Hero.tsx`, `FeaturesCreative.tsx`
- camelCase for utility/hook files: `useMediaQuery.ts`, `demo-data.ts`, `utils.ts`
- Directories use kebab-case for multi-word names: `floating-3d-carousel/`, `packing-prototype/`

**Components:**
- Export named React.FC components: `export const Navbar: React.FC = () => {}`
- Use "use client" directive for interactive components (state, hooks, event handlers)
- Component names match file names (e.g., `Navbar.tsx` exports `Navbar`)

**Variables:**
- camelCase for const/let: `const itemCount = 5;`, `let isMenuOpen = false;`
- UPPERCASE_SNAKE_CASE for constants: `DEMO_ORDER`, `CAROUSEL_AUTO_TURN_DELAY`, `TESTIMONIALS`
- Ref suffixes use "Ref": `componentRef`, `maskRef`, `cardsRef`

**Types:**
- PascalCase for interfaces: `Feature`, `CarouselFeature`, `DemoProduct`, `DemoOrder`
- Custom hook return types: `useMediaQuery` returns `boolean`, `useInterval` returns void
- Type discriminants: `ScanState = "idle" | "success" | "error"`

## Where to Add New Code

**New Feature Section:**
- Create component in `components/` directory with filename matching feature name
- Export named React.FC component
- Use "use client" directive if interactive
- Register GSAP context in useLayoutEffect if animations needed
- Import and add to `app/page.tsx` composition
- Example: `components/NewFeature.tsx` → import in `page.tsx` → add to JSX

**New Sub-Component Within Feature:**
- Create subdirectory if grouping multiple components: `components/new-feature/`
- Keep component files in subdirectory: `components/new-feature/Header.tsx`, `components/new-feature/Card.tsx`
- Create `types.ts` in subdirectory if types needed
- Create `demo-data.ts` if mock data needed
- Main component imports and orchestrates sub-components

**Utilities & Helpers:**
- Shared functions → `lib/utils.ts`
- Custom hooks → `hooks/useCustomHook.ts`
- Type definitions for global use → top-level `types.ts` (not yet in codebase, could be added)
- Feature-specific types → `components/feature-name/types.ts`

**Styling:**
- Global styles → `app/globals.css` (design tokens, keyframes, utilities)
- Component-scoped styles → inline `className` with Tailwind classes or `style` prop
- Don't create separate CSS files; use Tailwind @utility directives in globals.css for custom animations

**Animations:**
- GSAP ScrollTrigger animations → component-level useLayoutEffect context
- Framer Motion animations → inline motion components with variants
- Custom keyframes → add to `app/globals.css` as `@keyframes` then use in `@utility` directive

## Special Directories

**`.planning/`:**
- Purpose: Documentation and planning artifacts
- Generated: No (manually created)
- Committed: Yes (contains ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md)

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes (automatically by `npm run build`)
- Committed: No (.gitignored)

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (.gitignored, use package-lock.json for reproducibility)

**`public/`:**
- Purpose: Static files served at root level (images, favicons)
- Generated: No (manually created assets)
- Committed: Yes (contains logo SVGs, favicon, screenshots)

---

*Structure analysis: 2026-02-18*
