# Coding Conventions

**Analysis Date:** 2026-02-18

## Naming Patterns

**Files:**
- PascalCase for React components: `Hero.tsx`, `Navbar.tsx`, `FeatureShowcase.tsx`
- camelCase for utility files and hooks: `useInterval.ts`, `useMediaQuery.ts`, `utils.ts`
- kebab-case for feature directories: `floating-3d-carousel/`, `packing-prototype/`, `features/`
- Descriptive names without index prefixes: `CardCarousel.tsx` (not `1-CardCarousel.tsx`)

**Functions:**
- PascalCase for React components: `export const Hero: React.FC = () => { ... }`
- camelCase for utility functions: `getCSSVar()`, `cn()`, `mod()`
- Prefix hooks with `use`: `useInterval`, `useMediaQuery`
- Callback handlers prefixed with `handle`: `handleScroll`, `onChange`, etc.

**Variables:**
- camelCase for local variables: `isMenuOpen`, `items`, `lastScanItemId`, `progressPercent`
- Ref variables suffixed with `Ref`: `componentRef`, `maskRef`, `heroTextRef`, `charsRef`
- CSS variable names prefixed with `--color-`: `--color-primary-800`, `--color-surface-50`, `--color-text-primary`
- State variables describe value, not state: `isMenuOpen` (not `menuState`)
- Constants in UPPER_SNAKE_CASE: `CAROUSEL_AUTO_TURN_DELAY`, `DEMO_ORDER`, `DEFAULT_ADDRESS`

**Types:**
- PascalCase for interface/type names: `Feature`, `CarouselFeature`, `DemoProduct`, `ScanState`, `Address`, `ScreenSize`
- Exported from same file or dedicated `types.ts`: `export type CarouselFeature = { ... }`
- Generic type parameters as single letters: `React.FC<T>`, `Record<ScreenSize, string>`

## Code Style

**Formatting:**
- Uses TypeScript with React 19 and Next.js 16
- Tailwind CSS 4 for styling (utility-first approach)
- No explicit formatter config found; follows Next.js conventions
- Semicolons required at end of statements
- Single quotes for strings in code, double quotes in JSX attributes
- Spaces around object spread: `{ ...feature }`, `{ ...item }`

**Linting:**
- Next.js built-in ESLint (configured via `next lint`)
- Strict TypeScript: `tsconfig.json` has `strict: true`
- No custom ESLint config file found; uses Next.js defaults

## Import Organization

**Order:**
1. React and Next.js imports: `import React, { ... } from 'react';`
2. Third-party libraries: `import { gsap } from 'gsap';`, `import { motion } from 'framer-motion';`
3. Plugin registrations: `gsap.registerPlugin(ScrollTrigger);`
4. Local utility imports: `import { getCSSVar } from "@/lib/utils";`
5. Local component imports: `import { ScanVerifyVisual } from "./features/ScanVerifyVisual";`
6. Type imports at appropriate levels: `import type { Metadata } from "next";`, `import type { DemoProduct, ScanState } from "./types";`

**Path Aliases:**
- `@/*` maps to project root: `@/components`, `@/lib`, `@/hooks`
- Used consistently throughout: Never relative imports like `../../../`
- Defined in `tsconfig.json`: `"@/*": ["./*"]`

## Error Handling

**Patterns:**
- No explicit error boundaries observed in source files
- Defensive checks for refs: `if (el) charsRef.current[idx] = el;`
- Early returns with null checks: `if (!isMenuOpen) return;`, `if (!card) return;`
- No try-catch blocks visible in components (animation/UI-focused codebase)
- Default values prevent undefined access: `DEFAULT_ADDRESS`, `DEFAULT_LOCALE`

**Null/Undefined:**
- Optional chaining used minimally: mostly defensive assignments
- Refs checked before use: `if (scanTimerRef.current) clearTimeout(scanTimerRef.current);`
- Computed state prevents invalid states: `isComplete = totalScanned >= totalRequired`

## Logging

**Framework:**
- No logging framework used; console methods not observed in production code
- No log output in components
- Production use of console would indicate debugging (avoid in final code)

**Patterns:**
- Not applicable — landing page has no backend logging needs
- Client-side state managed via React hooks only
- No observability/monitoring calls in view layer

## Comments

**When to Comment:**
- Section headers with visual separators: `// ─── Constants ────────────────────────────────────────────`
- Complex GSAP animation sequences documented inline: `// 1. Background Expansion`, `// 2. Hero Text - Vanish`
- Business logic in GSAP contexts explained: Comments explain what animation does, not how GSAP works
- Short comments on non-obvious decisions: `// Close menu on scroll`, `// Derived state`
- No JSDoc/TSDoc observed; inline descriptions suffice for component props

**JSDoc/TSDoc:**
- Not used in this codebase
- React.FC type annotations serve as documentation: `export const Hero: React.FC = () => { ... }`
- Function signatures are self-documenting via TypeScript

## Function Design

**Size:**
- Components range from ~30 lines (simple presentational) to ~250 lines (complex with animations)
- Helper functions are single-responsibility: `mod()`, `getCSSVar()`, `cn()`
- Sub-components defined within files for scope isolation: `CarouselCardText`, `CarouselControls`, `FeatureCard`

**Parameters:**
- Props destructured in function signature: `function FeatureCard({ title, description, image, imageAlt, linkText, reversed }: Feature)`
- Callback props typed and named clearly: `onChange: (direction: number) => void`
- Optional boolean flags: `reversed?: boolean`, `isMenuOpen?: boolean`
- React.FC pattern for typed components: `export const Hero: React.FC = () => { ... }`

**Return Values:**
- Components return JSX.Element
- Hooks return typed values: `useMediaQuery` returns `boolean`, `useInterval` returns `void`
- Utilities return specific types: `getCSSVar` returns `string`, `cn` returns `string`
- No implicit any returns; all returns explicitly typed via function signature

## Module Design

**Exports:**
- Named exports preferred: `export const Hero: React.FC = () => { ... }`
- Single default export per file not used; all named exports
- Types exported via `export type`: `export type CarouselFeature = { ... }`
- Sub-components exported from same file when specific to parent

**Barrel Files:**
- No index.ts barrel files observed
- Imports specify exact files: `import { Hero } from "@/components/Hero"`, never from `@/components`
- Feature directories with multiple related files: types.ts co-located with components using those types

## Client Component Directive

**Pattern:**
- "use client" at top of interactive components: `Hero.tsx`, `Navbar.tsx`, `FeaturesCreative.tsx`, `CardCarousel.tsx`
- Server components are default in app directory (no directive)
- Used in components with: event handlers, hooks (useState, useEffect, useLayoutEffect), GSAP animations, Framer Motion
- Layout.tsx is a server component; app/page.tsx is a server component that composes client components

## Animation Patterns

**GSAP Usage:**
- Animations defined in `useLayoutEffect` with proper cleanup: `return () => ctx.revert();`
- ScrollTrigger for scroll-based animations: `scrollTrigger: { trigger, start, end, scrub }`
- Context-based cleanup ensures no memory leaks: `const ctx = gsap.context(() => { ... }, ref)`
- Timeline composition for multi-step animations: `gsap.timeline()` for orchestrated sequences

**Framer Motion Usage:**
- Motion components wrap JSX: `<motion.div variants={...} animate="show" exit="exit">`
- Variants object defines animation states: `{ hide: {...}, show: {...}, exit: {...} }`
- Used for simpler transitions alongside GSAP for complex scroll animations

## CSS & Styling

**Tailwind CSS:**
- Utility-first approach: `className="flex items-center gap-3 pl-2"`
- Custom CSS variables with Tailwind integration: `className="bg-[var(--color-primary-800)]"`
- Responsive prefixes: `lg:px-0`, `md:hidden`, `xl:text-5xl`, `sm:text-xl`
- Arbitrary values for specific values: `style={{ ... }}` for dynamic computed styles
- Opacity modifiers: `opacity-[0.08]`, `opacity-90`, `bg-black/5`

**Custom CSS:**
- Defined in `app/globals.css` with @import "tailwindcss"
- CSS variables organized by palette system: `[data-palette="a|b|c"]` switches 3 color themes
- Custom animations: `@keyframes fade-in-up`, `@keyframes scan-success`, `@keyframes glow-pulse`
- Utilities registered: `@utility bg-honeycomb`, `@utility animate-fade-in-up`
- Honeycomb SVG pattern for subtle visual theme

**Inline Styles:**
- Used for dynamic GSAP-driven values: `style={{ clipPath: "ellipse(...)" }}`
- SVG gradients and patterns: `style={{ background: "linear-gradient(...)" }}`
- Layout calculations: `style={{ width: `${w}px`, height: `${28 + (i % 3) * 4}px` }}`

## State Management

**Pattern:**
- useState for local component state: `const [isMenuOpen, setIsMenuOpen] = useState(false);`
- useRef for DOM references and non-state values: `const maskRef = useRef<HTMLDivElement>(null);`
- No global state management (Redux, Zustand, Context) in this landing page
- Derived state computed directly: `const isComplete = totalScanned >= totalRequired;`
- Props drilling for component composition; no prop drilling beyond 2-3 levels

## Type System

**Usage:**
- TypeScript strict mode enabled
- Component props typed via interface: `interface Feature { title, description, ... }`
- Function parameters explicitly typed: `callback: () => void`, `delay: number`
- React.FC generic pattern for components: `React.FC = () => { ... }`
- Union types for state: `type ScanState = "idle" | "success" | "error" | "pending"`
- Record utility for mappings: `Record<ScreenSize, string>`

---

*Convention analysis: 2026-02-18*
