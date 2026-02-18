# Technology Stack

**Analysis Date:** 2026-02-18

## Languages

**Primary:**
- TypeScript ~5.8.2 - All source files (`.ts`, `.tsx`)
- React 19.2.4 - Component framework and UI rendering

**Secondary:**
- CSS 4 - Global styles and Tailwind CSS processing via PostCSS

## Runtime

**Environment:**
- Node.js (latest LTS) - Required for Next.js 16
- Browser: Chromium/modern ES2017+ compatible browsers

**Package Manager:**
- npm 10+ (exact version in `.npmrc` not configured explicitly)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js `latest` (16+) - Full-stack React framework with App Router
  - Used for: Server-side rendering, API routes, static generation, image optimization
  - Entry point: `app/layout.tsx` and `app/page.tsx`

**UI & Animation:**
- React 19.2.4 - Component rendering engine
- Framer Motion 12.34.1 - Advanced animation library
  - Used in: `components/floating-3d-carousel/CardCarousel.tsx` for 3D carousel animations, pan/drag gestures, spring physics
  - Features: Motion components, MotionValue, useTransform, useTime, AnimatePresence
- GSAP 3.14.2 - Professional animation library
  - Used in: `components/Hero.tsx`, `components/floating-3d-carousel/FeatureCarouselSection.tsx`
  - Plugins: ScrollTrigger for scroll-linked animations and pinning
  - Features: Timeline animations, scroll triggers with matchMedia for responsive behavior

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
  - Config: `tailwind.config.ts` (implicit, uses default)
  - PostCSS: `postcss.config.mjs` with `@tailwindcss/postcss` plugin for Tailwind v4
- clsx 2.1.1 - Conditional classname utility
- tailwind-merge 3.4.1 - Merge Tailwind classes without conflicts

**Icons:**
- lucide-react 0.564.0 - Icon component library
  - Used in: `components/Navbar.tsx` (Menu, X, ArrowRight, ChevronRight icons)

**Typography:**
- Google Fonts integration via Next.js `next/font/google`
  - Inter font: weights 400, 500, 600, 700
  - Plus Jakarta Sans font: weights 500, 600, 700, 800
  - CSS variables: `--font-inter`, `--font-jakarta`

## Key Dependencies

**Critical:**
- next@latest - React framework enabling SSR, App Router, image optimization
- react@19.2.4 - React library (peer dependency)
- react-dom@19.2.4 - React DOM rendering
- framer-motion@12.34.1 - Complex animations and gestures for carousel
- gsap@3.14.2 - High-performance scroll-triggered animations with ScrollTrigger
- tailwindcss@4 - CSS generation from utility classes

**UI Components & Utilities:**
- lucide-react@0.564.0 - SVG icon components
- clsx@2.1.1 - Classname builder
- tailwind-merge@3.4.1 - Smart Tailwind class merging

## Configuration

**Environment:**
- No `.env` file detected - This is a static marketing site with no external API calls or secrets
- No environment variables required for local development or production

**Build:**
- `tsconfig.json`:
  - Target: ES2017
  - Module: esnext
  - JSX: react-jsx
  - Strict mode: enabled
  - Path alias: `@/*` → `./*` for imports
- `next.config.ts`:
  - Image optimization: Remote patterns for `images.unsplash.com`, `picsum.photos`, `ui-avatars.com`
  - No custom webpack or build modifications
- `postcss.config.mjs`:
  - Plugin: `@tailwindcss/postcss` for Tailwind CSS v4 processing

**Linting & Formatting:**
- Not detected - No `.eslintrc`, `.prettierrc`, or ESLint/Prettier in devDependencies
- Relies on Next.js built-in linting: `npm run lint` uses next lint

## Platform Requirements

**Development:**
- Node.js 18+ (for Next.js 16 compatibility)
- npm 8+ (for npm v8+ lockfile format)
- TypeScript compiler (installed via devDependencies)

**Production:**
- Deployment target: Vercel (typical for Next.js), or any Node.js hosting supporting Next.js standalone build
- Build output: `.next/` directory with standalone server
- Static assets: `public/` directory (SVGs, PNGs, WebP images)

## Build & Development

**Development Server:**
```bash
npm run dev              # Start Next.js dev server (port 3000 default)
```

**Production Build:**
```bash
npm run build            # Compile TypeScript, optimize assets, generate static pages
npm start              # Start production server
```

**Linting:**
```bash
npm run lint            # Run Next.js built-in linting (ESLint)
```

---

*Stack analysis: 2026-02-18*
