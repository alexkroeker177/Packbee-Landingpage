# Phase 1: Infrastructure - Research

**Researched:** 2026-02-18
**Domain:** Payload CMS 3.x embedded in existing Next.js 16 app — infrastructure setup specifics
**Confidence:** HIGH (most findings verified against official Payload docs, GitHub templates, and Next.js docs)

---

## Summary

This research covers the **implementation specifics** for Phase 1 that are not addressed in the project-level research (STACK.md, ARCHITECTURE.md, PITFALLS.md). The focus is on exactly what files exist now, what changes, what gets created, and in what order.

The existing app is a flat-structure Next.js 16.1.6 app with `app/layout.tsx` and `app/page.tsx` at the root of `app/`. No `src/` directory exists. Components, hooks, and lib live at project root. The `@/*` tsconfig alias resolves to the project root (`./*`), so `@/components/`, `@/lib/`, and `@/hooks/` all resolve correctly and do NOT need changes when the route restructuring happens — those directories are not moving.

The critical implementation sequence is: (1) restructure routes into `(marketing)` group, (2) install Payload, (3) create `(payload)` route group files, (4) update `next.config` and `tsconfig.json`, (5) write `payload.config.ts`, (6) connect Supabase and create initial migration.

**Primary recommendation:** Rename `next.config.ts` to `next.config.mjs` (ESM syntax, safer than relying on Node.js native TypeScript resolver). Keep `payload.config.ts` at the project root. Create `src/migrations/` directory for migration files (per locked STATE.md decision).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `payload` | `3.77.0` | Core CMS engine | Locked in STATE.md |
| `@payloadcms/next` | `3.77.0` | Next.js adapter (admin panel, REST API routes) | Locked in STATE.md |
| `@payloadcms/db-postgres` | `3.77.0` | PostgreSQL adapter (Drizzle ORM internally) | Locked in STATE.md |
| `@payloadcms/richtext-lexical` | `3.77.0` | Lexical rich text editor | Locked in STATE.md |
| `sharp` | `0.34.x` | Required for image processing | Payload peer dep |
| `graphql` | `^16.x` | Required peer dep for Payload's GraphQL layer | Payload peer dep |

### Version Constraints (LOCKED)
- All `@payloadcms/*` packages must be pinned at exactly `3.77.0` — mixed versions cause runtime errors
- Next.js is currently `16.1.6` — Payload 3.73.0+ is required for Next.js 16 compatibility; 3.77.0 satisfies this

**Installation:**
```bash
npm install payload@3.77.0 @payloadcms/next@3.77.0 @payloadcms/db-postgres@3.77.0 @payloadcms/richtext-lexical@3.77.0 graphql sharp --legacy-peer-deps
```
`--legacy-peer-deps` is required for React 19 peer dep conflicts (known temporary issue).

---

## Architecture Patterns

### Current File Structure (Before Changes)

```
Packbee-Landingpage/
├── app/
│   ├── globals.css          ← imports "tailwindcss", defines design tokens, custom animations
│   ├── layout.tsx           ← root layout: imports globals.css, sets up Google Fonts, metadata
│   └── page.tsx             ← home page: imports @/components/*
├── components/              ← all landing page components (NOT moving)
├── hooks/                   ← useInterval, useMediaQuery (NOT moving)
├── lib/
│   └── utils.ts             ← cn(), getCSSVar() (NOT moving)
├── public/images/           ← static assets
├── next.config.ts           ← minimal config: images.remotePatterns only
├── postcss.config.mjs       ← @tailwindcss/postcss
├── tsconfig.json            ← @/* → ./* alias
└── package.json             ← "next": "latest" (resolved to 16.1.6)
```

### Target File Structure (After Phase 1)

```
Packbee-Landingpage/
├── app/
│   ├── (marketing)/                        ← NEW route group (no URL impact)
│   │   ├── layout.tsx                      ← MOVED from app/layout.tsx
│   │   └── page.tsx                        ← MOVED from app/page.tsx
│   └── (payload)/                          ← NEW: Payload CMS infrastructure
│       ├── admin/
│       │   ├── [[...segments]]/
│       │   │   ├── page.tsx                ← auto-gen: renders Payload admin UI
│       │   │   └── not-found.tsx           ← auto-gen: admin 404 handler
│       │   └── importMap.js                ← auto-gen: maps custom components
│       ├── api/
│       │   └── [...slug]/
│       │       └── route.ts                ← auto-gen: REST API handler
│       ├── custom.scss                     ← empty file (admin CSS customization hook)
│       └── layout.tsx                      ← auto-gen: Payload admin layout
├── src/
│   └── migrations/                         ← NEW: Drizzle migration files (per STATE.md)
├── components/                             ← UNCHANGED
├── hooks/                                  ← UNCHANGED
├── lib/                                    ← UNCHANGED
├── public/images/
├── payload.config.ts                       ← NEW: Payload configuration (at project root)
├── payload-types.ts                        ← AUTO-GENERATED: TypeScript types (commit to git)
├── next.config.mjs                         ← RENAMED from next.config.ts + withPayload wrapper
├── postcss.config.mjs                      ← UNCHANGED
├── tsconfig.json                           ← MODIFIED: add @payload-config path alias
└── package.json                            ← MODIFIED: pin Next.js version, add Payload deps
```

### Why `(marketing)` not `(frontend)` or `(app)`

The STATE.md and PITFALLS.md both specify `(marketing)` as the route group name. The name is arbitrary (route groups are URL-transparent), but using `(marketing)` avoids confusion with the authenticated app (`app.packbee.com`) and signals intent clearly.

### Why `globals.css` stays in `(marketing)/layout.tsx` (NOT at root)

The root `app/` level must NOT have a `layout.tsx` that imports `globals.css`. Payload's admin uses CSS with `@layer payload-default` which has lower specificity than un-layered CSS. If Tailwind v4's `@import "tailwindcss"` (which injects preflight and utilities as un-layered CSS) runs in a parent layout, it overrides Payload's admin styles, breaking the admin UI visually.

**The root layout must be minimal or nonexistent.** `globals.css` must only be imported in `(marketing)/layout.tsx`, not in any ancestor.

---

## Step-by-Step Implementation Details

### Step 1: Route Group Restructure (BEFORE package install)

**What moves:**
- `app/layout.tsx` → `app/(marketing)/layout.tsx`
- `app/page.tsx` → `app/(marketing)/page.tsx`
- `app/globals.css` → stays at `app/globals.css` but the import path in `(marketing)/layout.tsx` must be updated

**Import path in `(marketing)/layout.tsx`:**
```typescript
import "../globals.css";   // relative path: one level up from (marketing)/
```
Route groups are transparent to the filesystem — `(marketing)/layout.tsx` is in `app/(marketing)/`, so `../globals.css` resolves to `app/globals.css`. Alternatively, move `globals.css` into `(marketing)/` folder and use `./globals.css`.

**`@/` imports in `page.tsx` are unaffected:**
The tsconfig alias `"@/*": ["./*"]` maps to the project root. After the move, `app/(marketing)/page.tsx` still resolves `@/components/Navbar` to `./components/Navbar` (project root). No import changes needed in `page.tsx`.

**No root `app/layout.tsx` is needed** — Next.js does not require a root layout when all routes are inside route groups. If one is wanted for `<html>/<body>` wrapping only, it must NOT import `globals.css`.

**Verification:** After restructuring (before Payload install), run `npm run dev` and confirm `/` renders identically.

### Step 2: Rename `next.config.ts` → `next.config.mjs`

Payload requires ESM (`withPayload` is an ES module). The official docs and all Payload templates use `.mjs` or `.js` with ESM syntax.

While Node.js v22.18.0+ enables native TypeScript support by default (`process.features.typescript = 'strip'`), this enables `next.config.ts` to use ESM syntax in theory. However:
- Next.js docs state: "Module resolution in next.config.ts is currently limited to CommonJS" unless using the Node.js native TypeScript resolver
- The Next.js docs recommend `.mts` for CJS projects wanting ESM syntax in config
- Payload's official template uses `next.config.js` (plain JS with ESM)
- Community consistently uses `next.config.mjs` for Payload projects
- Renaming to `.mjs` is universally safe and well-documented

**Decision: Rename to `next.config.mjs`** — eliminates ambiguity, matches Payload's own templates.

**New `next.config.mjs` contents:**
```javascript
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "picsum.photos" },
      { hostname: "ui-avatars.com" },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
```

**Notes on `devBundleServerPackages: false`:**
- This is the second argument to `withPayload()` (not inside `nextConfig`)
- It was introduced in Payload v3.28.0 and is opt-in for existing projects
- Effect: prevents Next.js from bundling Payload's server packages during dev compilation, cutting compile times in half
- The Payload official template uses this flag explicitly (`next.config.js` in `templates/website`)
- Confirmed safe for production builds

### Step 3: `tsconfig.json` Changes

Add `@payload-config` path alias. The existing `@/*` alias stays unchanged — it points to the project root (`./*`) and works for `@/components/`, `@/lib/`, `@/hooks/`.

**Modified `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"],
      "@payload-config": ["./payload.config.ts"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**Why `"./payload.config.ts"` not `"./src/payload.config.ts"`:** The `payload.config.ts` lives at the project root, not in `src/`. The `src/` directory only contains `migrations/`. This matches the official installation docs ("Create payload.config.ts" at root level) and the `@payload-config` alias in the blank template.

### Step 4: The `(payload)` Route Group Files

These files are all **boilerplate — copied verbatim** from Payload's template. They should not be modified.

**`app/(payload)/layout.tsx`:**
```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
```

**`app/(payload)/custom.scss`:** Empty file (placeholder for admin customization).

**`app/(payload)/admin/importMap.js`:**
```javascript
import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'

export const importMap = {
  '@payloadcms/next/rsc#CollectionCards': CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
}
```
Note: This file gets regenerated by Payload when you run `payload generate:importmap`. The initial version from the blank template is correct to start.

**`app/(payload)/admin/[[...segments]]/page.tsx`:**
```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap })

export default Page
```

**`app/(payload)/admin/[[...segments]]/not-found.tsx`:**
```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { NotFoundPage } from '@payloadcms/next/views'
import { importMap } from '../importMap'

const NotFound = () => NotFoundPage({ config, importMap })
export default NotFound
```

**`app/(payload)/api/[...slug]/route.ts`:**
```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
```

### Step 5: `payload.config.ts` Minimal Boilerplate for Phase 1

This is the Phase 1 config — minimal, with only a `Users` collection (Phase 2 adds Posts, Media, etc.).

```typescript
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [],  // Users collection added in Phase 2
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: false,
    migrationDir: './src/migrations',
  }),
  sharp,
  plugins: [],
})
```

**Critical settings explained:**
- `push: false` — set from day one per STATE.md decision; never auto-apply schema changes to Supabase
- `migrationDir: './src/migrations'` — per STATE.md locked decision; creates `src/migrations/` directory
- `importMap.baseDir: path.resolve(dirname)` — required so Payload can find custom component paths relative to the config file
- `typescript.outputFile` — places `payload-types.ts` at project root; commit this file to git
- `fileURLToPath(import.meta.url)` — required because `payload.config.ts` is ESM; `__dirname` is not available

**Note on `collections: []`:** Phase 1 is purely infrastructure. An empty collections array is valid. The database schema will be nearly empty (just Payload's internal tables) after the first migration. The `Users` collection needed for admin login is added in Phase 2 when we set up the full content model.

Actually, reconsider: A `Users` collection with `auth: true` is **required** to access the admin panel. Without it, `/admin` will not function. A minimal Users collection should be in Phase 1's config:

```typescript
// src/collections/Users.ts  (create this file)
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [],
}
```

Then import it in `payload.config.ts`:
```typescript
import { Users } from './src/collections/Users'
// ...
collections: [Users],
```

### Step 6: Environment Variables

Create `.env.local` at project root:
```bash
# Supabase PostgreSQL - transaction pooler (port 6543, NOT direct connection port 5432)
DATABASE_URI=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Payload CMS secret - must be 32+ chars, cryptographically random
# Generate: openssl rand -base64 32
PAYLOAD_SECRET=

# For Payload SEO plugin generateURL and live preview
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**`DATABASE_URI` vs `DATABASE_URL`:** The Payload template example uses `DATABASE_URL`. Official Payload docs show `DATABASE_URI` as the conventional variable name for the postgres adapter. Both work — what matters is consistency with `payload.config.ts`. This project uses `DATABASE_URI` (matching the postgres adapter conventional name shown in STACK.md).

**Supabase transaction pooler URL format:** Supabase transaction pooler uses a different hostname format from the direct connection. Find it in: Supabase Dashboard → Project → Settings → Database → Connection pooling section → Select "Transaction" mode.

**Add `.env.local` to `.gitignore`:** The current `.gitignore` has `*.local` which covers `.env.local`. Confirmed safe.

### Step 7: Initial Migration with `push: false`

With `push: false` set from the beginning, the database schema is NOT applied automatically. You must create and run migrations explicitly.

**Workflow for Phase 1 initial migration:**
```bash
# 1. Start the dev server once to verify Payload starts (will fail DB connection until Supabase is connected)
# 2. Once DATABASE_URI is configured and Supabase is reachable:

# Create the initial migration (generates SQL for all current collections)
npx payload migrate:create --name initial

# This creates: src/migrations/20260218_initial.ts (or similar timestamp format)

# Run the migration against Supabase
npx payload migrate
```

**What `migrate:create` does on first run:**
- Compares current `payload.config.ts` collections against the database state
- Since the database is empty (no prior Payload schema), generates full DDL for all tables
- Creates a file in `src/migrations/` with `up()` and `down()` functions containing the SQL

**Do NOT mix push and migrate:** If you accidentally run with `push: true` even once, Payload will warn you that push and migrations are not meant to be used interchangeably. Keep `push: false` from the very first boot.

**Commit migration files:** The generated files in `src/migrations/` are application code, not build artifacts. Commit them to git immediately after creation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| (payload) route group files | Custom admin routing | Copy from `templates/blank/src/app/(payload)/` verbatim | Files are auto-generated markers; custom code risks being overwritten |
| Import map | Manual component registration | `npx payload generate:importmap` | Payload regenerates this; manual editing breaks on next generate run |
| TypeScript types | Manually typed Payload types | `npx payload generate:types` | Payload generates from config; always in sync |
| Admin CSS | Global CSS overrides | `custom.scss` in `(payload)/` only | The `custom.scss` file is the correct isolation boundary |

---

## Common Pitfalls

### Pitfall 1: `globals.css` Import in a Layout Above `(marketing)`
**What goes wrong:** If `globals.css` (which contains `@import "tailwindcss"` — Tailwind v4's un-layered CSS injection) is imported in any layout that is an ancestor of `(payload)` routes, Tailwind's preflight and utilities override Payload's admin CSS, breaking the admin UI.
**Prevention:** After moving to `(marketing)/layout.tsx`, confirm there is NO `layout.tsx` at the `app/` level that imports CSS. The root `app/` level should either have no layout file at all, or a completely minimal one (`<html><body>{children}</body></html>` with no CSS import).

### Pitfall 2: Forgetting to Delete the Original `app/layout.tsx` and `app/page.tsx`
**What goes wrong:** After creating `app/(marketing)/layout.tsx` and `app/(marketing)/page.tsx`, the original files remain. Next.js will have two conflicting routes for `/`.
**Prevention:** The move operation is delete-and-create (or git mv). Explicitly verify `app/layout.tsx` and `app/page.tsx` are gone after the restructuring step.

### Pitfall 3: `next.config.ts` Not Renamed Before Payload Install
**What goes wrong:** The `withPayload` wrapper is ESM. If `next.config.ts` is not renamed to `.mjs` first, the import will fail with module resolution errors on first `npm run dev` after installing Payload.
**Prevention:** Rename `next.config.ts` → `next.config.mjs` as an explicit step before `npm install payload...`.

### Pitfall 4: `push: false` Not Set in First Commit
**What goes wrong:** The default is `push: true` (dev only). If the first boot of Payload runs against the Supabase instance with `push: true`, schema is applied without a migration file. Switching to `push: false` after this point triggers the "Don't mix push and migrations" warning.
**Prevention:** `push: false` and `migrationDir: './src/migrations'` must be in `payload.config.ts` before the very first `npm run dev` against the Supabase database.

### Pitfall 5: Next.js Version Not Pinned
**What goes wrong:** `package.json` currently has `"next": "latest"` (resolved to 16.1.6). Running `npm install` again could upgrade to a newer canary version that is ahead of Payload's tested compatibility window.
**Prevention:** After confirming 16.1.6 works with Payload 3.77.0, pin the version: `"next": "16.1.6"` in `package.json`. Note: Payload 3.77.0 requires Next.js `>=16.1.1-canary.35` or `16.2.0+`. Version 16.1.6 is within the supported range (it satisfies `>=16.1.1-canary.35`). However, the exact released stable version should be confirmed. The safest pin is to whatever resolves at install time.

**IMPORTANT:** Next.js 16.1.6 may be a canary/development version, not a stable release. The Payload compatibility documentation states support for `16.2.0-canary.10+`. Verify 16.1.6 works or upgrade to 16.2.0+ stable if available. This needs validation at implementation time.

### Pitfall 6: `src/migrations` Directory Not Created Before `migrate:create`
**What goes wrong:** `migrate:create` may fail or place files in an unexpected location if `src/migrations/` does not exist.
**Prevention:** Create the `src/migrations/` directory (with a `.gitkeep`) before running any migration commands.

### Pitfall 7: `@payload-config` Alias Points to Wrong File Location
**What goes wrong:** If `payload.config.ts` is at project root but the tsconfig alias says `"./src/payload.config.ts"`, all `(payload)` route group files that import `from '@payload-config'` will fail to resolve.
**Prevention:** The alias must match the actual file location. With `payload.config.ts` at root: `"@payload-config": ["./payload.config.ts"]`.

---

## Code Examples

### Verified: Complete `(payload)/layout.tsx`
```typescript
// Source: github.com/payloadcms/payload/blob/main/templates/blank/src/app/(payload)/layout.tsx
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = { children: React.ReactNode }

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
```

### Verified: Complete `(payload)/api/[...slug]/route.ts`
```typescript
// Source: github.com/payloadcms/payload/blob/main/templates/blank/src/app/(payload)/api/[...slug]/route.ts
import config from '@payload-config'
import '@payloadcms/next/css'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
```

### Verified: Complete `(payload)/admin/[[...segments]]/page.tsx`
```typescript
// Source: github.com/payloadcms/payload/blob/main/templates/website/src/app/(payload)/admin/[[...segments]]/page.tsx
import type { Metadata } from 'next'
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap })

export default Page
```

### Verified: `next.config.mjs` with `withPayload`
```javascript
// Source: github.com/payloadcms/payload/blob/main/templates/website/next.config.js
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "picsum.photos" },
      { hostname: "ui-avatars.com" },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
```

### Verified: `postgresAdapter` with `push: false`
```typescript
// Source: payloadcms.com/docs/database/postgres + STATE.md locked decisions
import { postgresAdapter } from '@payloadcms/db-postgres'

db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URI || '',
  },
  push: false,
  migrationDir: './src/migrations',
}),
```

### Minimal Users Collection (Required for Admin Access)
```typescript
// src/collections/Users.ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [],
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `next.config.js` (CommonJS) | `next.config.mjs` (ESM) | Required for `withPayload` import |
| `push: true` (default) | `push: false` + `migrate:create` | Safe for shared Supabase instances |
| Manual type authoring | `payload generate:types` → `payload-types.ts` | Types always match config |
| Root `app/layout.tsx` only | Route groups: `(marketing)` + `(payload)` | CSS isolation between admin and landing page |

---

## Open Questions

1. **Is Next.js 16.1.6 a stable release or canary?**
   - What we know: `package.json` says `"next": "latest"` resolved to `16.1.6`. Payload compatibility requires `>=16.1.1-canary.35` or `16.2.0+`.
   - What's unclear: Whether `16.1.6` satisfies the Payload compatibility threshold. The version numbering suggests canary (below `16.2.0` stable). May need to upgrade to `16.2.0` stable.
   - Recommendation: At implementation start, run `npm show next@16.2.0 version` to check if `16.2.0` stable is available. If so, upgrade before Payload install. If 16.1.6 works (satisfies `>=16.1.1-canary.35`), pin it explicitly.

2. **Should `payload.config.ts` use a `src/` directory prefix?**
   - What we know: The project has no `src/` directory. Official docs place config at root. Templates use `src/`. STATE.md uses `migrationDir: './src/migrations'` (implying `src/` exists for migrations).
   - What's unclear: Whether the planner wants `payload.config.ts` at root or in `src/`.
   - Recommendation: Place `payload.config.ts` at project root (cleaner, matches official docs). Create `src/migrations/` only for migration files. The `@payload-config` tsconfig alias is `"./payload.config.ts"`.

3. **Does the `(marketing)` route group need a root `app/layout.tsx`?**
   - What we know: Next.js App Router does not require a root `layout.tsx` when all routes are in route groups. However, some Next.js versions may emit warnings.
   - What's unclear: Whether Next.js 16 requires a root layout.
   - Recommendation: Start without a root `app/layout.tsx`. If Next.js emits errors or `/` fails to serve, add a minimal root layout `<html lang="de"><body>{children}</body></html>` (no CSS imports).

---

## Sources

### Primary (HIGH confidence)
- [Payload blank template - (payload) route files](https://github.com/payloadcms/payload/tree/main/templates/blank/src/app/%28payload%29) — exact boilerplate files
- [Payload website template - next.config.js](https://github.com/payloadcms/payload/blob/main/templates/website/next.config.js) — `withPayload` + `devBundleServerPackages`
- [Payload website template - tsconfig.json](https://github.com/payloadcms/payload/blob/main/templates/website/tsconfig.json) — `@payload-config` path alias
- [Payload installation docs (GitHub)](https://github.com/payloadcms/payload/blob/main/docs/getting-started/installation.mdx) — manual install steps
- [Next.js TypeScript config docs](https://nextjs.org/docs/pages/api-reference/config/typescript) — `next.config.ts` ESM limitations

### Secondary (MEDIUM confidence)
- [buildwithmatija.com: Push to Migrations guide](https://www.buildwithmatija.com/blog/payloadcms-postgres-push-to-migrations) — migration workflow, cross-referenced with official docs
- [devBundleServerPackages release notes](https://github.com/payloadcms/payload/releases/tag/v3.28.0) — confirmed parameter name and opt-in behavior

### Tertiary (LOW confidence)
- Node.js v22.21.1 native TypeScript support (`process.features.typescript: 'strip'`) — theoretically enables ESM in `next.config.ts`, but not recommended over `.mjs` given Next.js docs caveat

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions locked in STATE.md, npm-verified in project-level research
- Architecture (file structure): HIGH — verified against actual project files + official Payload templates
- (payload) route group files: HIGH — copied from official templates, content verified
- `next.config.mjs` approach: HIGH — documented in official Payload installation guide
- `push: false` migration workflow: HIGH — official docs + locked STATE.md decision
- `@payload-config` tsconfig alias: HIGH — verified from template tsconfig.json
- Supabase connection string format: MEDIUM — STACK.md verified, exact Supabase project URL format varies per project

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable Payload 3.x, no fast-moving changes expected for these APIs)
