# External Integrations

**Analysis Date:** 2026-02-18

## APIs & External Services

**Image Services:**
- Placeholder Images (picsum.photos)
  - Used for: Carousel feature images in `components/floating-3d-carousel/FeatureCarouselSection.tsx`
  - URLs: `https://picsum.photos/seed/packbee-analytics/960/600`, `/seed/packbee-team/960/600`, `/seed/packbee-channels/960/600`
  - Purpose: Placeholder images for analytics, team, and multi-channel feature cards
  - Configuration: Configured in `next.config.ts` under `images.remotePatterns`

**Unsplash Integration:**
- Service: images.unsplash.com
  - Purpose: Potentially for hero images or other placeholder content (configured but not actively used in current codebase)
  - Configuration: Configured in `next.config.ts` under `images.remotePatterns`

**Avatar Service:**
- Service: ui-avatars.com
  - Purpose: Generate avatar images for users (configured but not actively used in current codebase)
  - Configuration: Configured in `next.config.ts` under `images.remotePatterns`

## Data Storage

**Databases:**
- Not applicable - This is a static marketing/landing page with no backend database

**File Storage:**
- Local filesystem only
  - Static assets: `/public/images/` directory
  - Images served as static files via Next.js

**Caching:**
- Next.js built-in caching:
  - Image optimization cache: `.next/cache/images/`
  - Static page cache: `.next/` directory
  - Client-side: browser cache via HTTP headers (configured by Next.js)

## Authentication & Identity

**Auth Provider:**
- None - This is a public marketing site with no authentication
- No login/signup functionality

## Monitoring & Observability

**Error Tracking:**
- Not detected - No error tracking service (Sentry, Rollbar, etc.) configured

**Logs:**
- Browser console only (for development)
- Production: Standard Next.js logs via deployment platform (Vercel, etc.)

**Analytics:**
- Not detected - No analytics service (Google Analytics, Mixpanel, etc.) integrated
- No tracking scripts found in `app/layout.tsx` or global configuration

## CI/CD & Deployment

**Hosting:**
- Not specified in this repository
- Typical deployment: Vercel (for Next.js), or any Node.js hosting (AWS, Netlify, Heroku, self-hosted)

**CI Pipeline:**
- Not detected - No `.github/workflows/`, `.gitlab-ci.yml`, or similar found
- Likely managed at monorepo level (parent `packbee/` directory)

**Build Process:**
- Standard Next.js: TypeScript compilation → React SSR → Static generation
- Output: Standalone server or static export depending on deployment

## Environment Configuration

**Required env vars:**
- None - This landing page has no environment-specific configuration

**Optional env vars:**
- Not detected - No `.env.local`, `.env`, `.env.example` files present

**Secrets location:**
- Not applicable - No secrets required for this landing page

## Webhooks & Callbacks

**Incoming:**
- None - No API endpoints or webhook receivers

**Outgoing:**
- None - No callbacks or external API calls to third-party services

## Google Fonts

**Fonts Loaded:**
- Inter (weights: 400, 500, 600, 700)
  - CSS variable: `--font-inter`
  - Used for: Body text
- Plus Jakarta Sans (weights: 500, 600, 700, 800)
  - CSS variable: `--font-jakarta`
  - Used for: Headings
- Provider: Google Fonts via Next.js `next/font/google` (automatic subsetting and optimization)
- Subset: `latin` only (other scripts excluded for performance)

## CDN & Content Delivery

**Image Optimization:**
- Next.js Image Component (`next/image`)
  - Used in: `components/floating-3d-carousel/CardCarousel.tsx`
  - Features: Automatic format conversion (WebP), responsive sizing, lazy loading, blur placeholder
  - Remote patterns configured for: `images.unsplash.com`, `picsum.photos`, `ui-avatars.com`

**Static Asset Delivery:**
- Local public assets: `/public/images/` served by Next.js
- SVGs: Packbee logos (Full-Black, Full-White variants)
- PNGs: Dashboard and Verlauf screenshots

## Third-Party Scripts

**Scripts Loaded:**
- None detected - No tracking, analytics, or third-party JavaScript loaded

**Custom Scripts:**
- None - All functionality is React/JavaScript bundled with the application

## API Routes & Backend

**Backend Integration:**
- None - This is a frontend-only landing page
- No API routes in `app/api/`

**External API Calls:**
- None from client code - Only static image fetching for placeholder content

---

*Integration audit: 2026-02-18*
