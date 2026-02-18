# Domain Pitfalls: Payload CMS 3.x into Existing Next.js App

**Domain:** Payload CMS 3.x embedded into existing Next.js 16 landing page
**Researched:** 2026-02-18
**Research mode:** Pitfalls dimension (milestone-scoped)
**Overall confidence:** HIGH — majority of findings verified against official Payload docs, GitHub issues, and community help threads

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or complete integration failures.

---

### Pitfall 1: Payload Config Importing Client Code (CSS / React Components)

**What goes wrong:** `payload.config.ts` must be Node.js-safe. If you import a component that transitively imports CSS (e.g. `import RichText from '@payloadcms/richtext-lexical'` with its bundled `.css`), or mix JSX exports with your config export in the same file, the build fails with:
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".css"
```
This error surfaces when running `payload generate:types`, `payload migrate`, or the production build itself.

**Why it happens:** Payload's config is evaluated in a pure Node.js context for CLI commands and server bootstrapping. Node's ESM loader cannot handle `.css` or client-only modules. The trap is easy to fall into when extending collections with custom admin components — you reach for a direct import instead of using Payload's component path syntax.

**Consequences:** Build fails entirely. No workaround at runtime; must fix the import.

**Warning signs:**
- `Unknown file extension ".css"` during any `payload` CLI command
- `Cannot find module` errors that point inside `@payloadcms/richtext-lexical/dist/exports/react`
- Any import inside `payload.config.ts` referencing a file under `components/` or `app/`

**Prevention strategy:**
- Never directly import React components or files with side-effect CSS imports into `payload.config.ts`.
- Use Payload's component path string syntax for admin UI overrides:
  ```ts
  // Correct
  admin: {
    components: {
      beforeList: ['/src/components/MyBeforeList#MyBeforeList'],
    }
  }
  // Wrong — will fail
  import { MyBeforeList } from '@/components/MyBeforeList'
  ```
- Keep `payload.config.ts` importing only pure TypeScript/Node-safe modules.
- Separate JSX component files from config files. Never export both from the same module.

**Phase:** Integration setup (Phase 1). Catch this before writing any custom admin components.

**Source:** [GitHub issue #7437](https://github.com/payloadcms/payload/issues/7437), [dFlow Tips & Tricks](https://dflow.sh/blog/payloadcms-tips-and-tricks), [GitHub issue #10797](https://github.com/payloadcms/payload/issues/10797)
**Confidence:** HIGH

---

### Pitfall 2: Using `push: true` in the PostgreSQL Adapter Beyond Local Dev

**What goes wrong:** `postgresAdapter({ push: true })` auto-applies schema changes to the database without a migration file. In production (or even staging), this creates unreviewable, unversioned schema mutations. Worse, using `push` mode on an existing database triggers a known bug:
```
ALTER TABLE "_products_v_rels" ALTER COLUMN "id" SET DATA TYPE serial
-- ERROR: type "serial" does not exist
```
This fails because `serial` is a PostgreSQL pseudo-type not valid in `ALTER TABLE` context.

**Why it happens:** `push: true` is the default in Payload's quick-start templates to reduce friction. Teams forget to disable it before going live, or assume it's equivalent to migrations.

**Consequences:** Untracked schema drift between environments, possible data loss on destructive schema changes, broken CI on an existing Supabase database.

**Warning signs:**
- `next dev` works but `next build` or CI fails with Drizzle schema errors
- Database has tables that no migration file accounts for
- Deploying a new env from scratch fails because `push` ran partially

**Prevention strategy:**
- Disable `push` immediately in your initial Payload setup commit:
  ```ts
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    push: false,                           // Explicit: no auto-push ever
    migrationDir: './src/migrations',      // Tracked in git
  })
  ```
- Use `npx payload migrate:create` locally, commit the generated SQL file, run `npx payload migrate` in CI/CD.
- Never run migrations against the product Supabase instance. Use a dedicated Supabase project for the landing page CMS.

**Phase:** Integration setup (Phase 1) — set `push: false` before writing the first collection.

**Source:** [GitHub issue #14035](https://github.com/payloadcms/payload/issues/14035), [buildwithmatija.com: Push to Migrations guide](https://www.buildwithmatija.com/blog/payloadcms-postgres-push-to-migrations), [Payload Postgres docs](https://payloadcms.com/docs/database/postgres)
**Confidence:** HIGH

---

### Pitfall 3: Existing Root `layout.tsx` and `globals.css` Bleeding Into the Admin Panel

**What goes wrong:** The Packbee landing page uses a root `app/layout.tsx` that imports `globals.css`. This CSS file uses `@import "tailwindcss"` (Tailwind v4), which injects global resets (`preflight`) and custom tokens. When Payload's admin panel is served under the same Next.js app, any `layout.tsx` at a level above `(payload)` will also wrap admin routes, applying the landing page's resets and typography styles to Payload's admin UI — breaking button styling, form elements, and layout.

**Why it happens:** Next.js App Router applies every ancestor `layout.tsx` to nested routes. Developers add Payload into the existing `app/` directory without wrapping their existing routes in a route group, leaving the root layout to cover everything including `/admin`.

**Consequences:** Payload's admin panel looks broken — unstyled buttons, blown-out typography, broken form layouts. This is a visual regression that's easy to miss in local dev if you don't visit `/admin` after setup.

**Warning signs:**
- After install, `/admin` shows raw HTML structure without proper admin styling
- Payload admin buttons lose their visual appearance
- Console shows CSS layer ordering warnings

**Prevention strategy:**
- Before installing Payload, restructure the app into route groups:
  ```
  app/
  ├─ (marketing)/         # All existing landing page routes
  │  ├─ layout.tsx        # Landing page layout (imports globals.css)
  │  └─ page.tsx          # Existing homepage
  ├─ (payload)/           # Payload-generated folder
  │  ├─ admin/[[...segments]]/page.tsx
  │  └─ api/[...slug]/route.ts
  └─ layout.tsx           # Minimal root: <html><body>{children}</body></html> only
  ```
- The root `layout.tsx` must NOT import `globals.css`. Move that import into `(marketing)/layout.tsx`.
- Payload's CSS uses `@layer payload-default`, which has lower specificity than un-layered CSS. If your app CSS is un-layered, it overrides admin styles regardless of load order.

**Phase:** Integration setup (Phase 1) — route group restructure must happen before Payload install.

**Source:** [GitHub issue #8878 — Tailwind reset breaks admin](https://github.com/payloadcms/payload/issues/8878), [Payload CSS customization docs](https://payloadcms.com/docs/admin/customizing-css), [Payload admin panel docs](https://payloadcms.com/docs/admin/overview)
**Confidence:** HIGH

---

### Pitfall 4: Next.js Version / Turbopack Compatibility Gap

**What goes wrong:** The project currently uses `"next": "latest"`. Payload's `withPayload` wrapper historically injected a webpack config that conflicted with Next.js 16's default Turbopack setup. Earlier versions (before Payload v3.73.0, released January 2026) would fail at startup with:
- `withPayload unconditionally injects webpack config — breaks Next.js 16 default Turbopack setup`
- `Error: Payload does not support using Turbopack for production builds` (versions 3.64–3.65)
- `Could not find the module X in the React Client Manifest` (HMR spam on 15.5.x+)

As of Payload v3.73.0, full Next.js 16 compatibility (Turbopack dev + build) was achieved, but requires **Next.js >16.1.1-canary.35 or 16.2.0+**. There is also an open issue (#15429) where Payload config returns `null` in RSC context during production builds on canary versions.

**Why it happens:** Rapid co-evolution of Next.js and Payload; using `"next": "latest"` pins to the newest canary/rc which may be ahead of Payload's tested compatibility window.

**Warning signs:**
- Dev server hangs or crashes on startup after Payload install
- `/admin` route returns 500 with module-not-found errors
- Production build fails with Turbopack bundler errors
- HMR shows constant "React Client Manifest" errors in console

**Prevention strategy:**
- Pin Next.js to a known-compatible version. At time of research, use Next.js `16.2.0` (stable) or `>=16.1.1-canary.35` paired with Payload `>=3.73.0`.
- Do not use `"next": "latest"` during the Payload integration — lock the version explicitly in `package.json`.
- After install, test both `next dev` and `next build` before writing any collections.
- Monitor the Payload GitHub discussion [#14330](https://github.com/payloadcms/payload/discussions/14330) for compatibility updates.

**Phase:** Integration setup (Phase 1) — version pinning before `npx create-payload-app`.

**Source:** [GitHub discussion #14330](https://github.com/payloadcms/payload/discussions/14330), [GitHub issue #14354](https://github.com/payloadcms/payload/issues/14354), [buildwithmatija.com: Next.js 16 compatibility](https://www.buildwithmatija.com/blog/payload-cms-nextjs-16-compatibility-breakthrough), [GitHub issue #15429](https://github.com/payloadcms/payload/issues/15429)
**Confidence:** HIGH (version requirements verified from release notes)

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt but are recoverable.

---

### Pitfall 5: `withPayload` Wrapping Breaks Existing `next.config.ts`

**What goes wrong:** Payload requires wrapping the Next.js config with `withPayload()`. This function modifies webpack config, `transpilePackages`, and `experimental` options. If the existing `next.config.ts` has custom webpack plugins, PostCSS loaders, or `experimental` flags, they can be silently overridden or conflict with Payload's injected configuration.

The Packbee landing page currently has a minimal config (only `images.remotePatterns`), but Tailwind v4's PostCSS integration (`@tailwindcss/postcss`) and any future GSAP/Framer animation-related webpack plugins are at risk.

**Warning signs:**
- Tailwind styles stop applying after adding `withPayload`
- Custom webpack plugins stop executing
- Build warnings about duplicate configuration keys
- `@tailwindcms/postcss` not processing CSS files after wrapping

**Prevention strategy:**
```ts
// next.config.ts — correct pattern
import { withPayload } from '@payloadcms/next'

const nextConfig: NextConfig = {
  // Your existing config
  images: { remotePatterns: [...] },
  // Do NOT define webpack here if Payload also needs to modify it
  // unless you merge carefully:
  webpack: (config, options) => {
    // Your custom additions
    config.plugins.push(...)
    return config   // Always return — Payload wraps this result
  },
}

export default withPayload(nextConfig)
```
- Test `next build` immediately after wrapping, before adding collections.
- Verify Tailwind v4 CSS compilation is working by checking rendered styles on a known-styled page.

**Phase:** Integration setup (Phase 1).

**Source:** [GitHub issue #14354](https://github.com/payloadcms/payload/issues/14354), [Payload blog: 3.0 beta install](https://payloadcms.com/posts/blog/30-beta-install-payload-into-any-nextjs-app-with-one-line)
**Confidence:** MEDIUM (specific behavior of withPayload + @tailwindcss/postcss v4 not directly verified)

---

### Pitfall 6: `tsconfig.json` Missing Required Payload Path Alias

**What goes wrong:** Payload requires a `paths` alias in `tsconfig.json` pointing `payload-config` to your `payload.config.ts`. Without it, Payload cannot locate the config in production mode, falling back to the working directory which may differ between local and CI/CD builds. The existing project has `"@/*": ["./*"]` but is missing the Payload-specific alias.

Additionally, Payload's `generate:types` command is sensitive to tsconfig `rootDir`. If `rootDir` differs from where `payload.config.ts` lives, generated `payload-types.ts` may be output to an unexpected location.

**Warning signs:**
- `payload 30 cannot find module payload config or its corresponding type declarations`
- TypeScript errors on `import type { Config } from 'payload'` in production build
- Generated types appear in wrong directory

**Prevention strategy:**
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@payload-config": ["./src/payload.config.ts"]
    }
  }
}
```
Also configure the output file explicitly in `payload.config.ts`:
```ts
typescript: {
  outputFile: path.resolve(dirname, 'payload-types.ts'),
},
```
Commit the generated `payload-types.ts` to git (it is a build artifact but required for type checking without a build step).

**Phase:** Integration setup (Phase 1).

**Source:** [Payload TypeScript docs](https://payloadcms.com/docs/typescript/overview), [Community: cannot find module payload-config](https://payloadcms.com/community-help/discord/payload-30-cannot-find-module-payload-config-or-its-corresponding-type-declarations)
**Confidence:** HIGH

---

### Pitfall 7: Dev Server Compilation Performance (10–60 Second Rebuilds)

**What goes wrong:** Payload has thousands of internal modules. Without optimization, `next dev` compilation times on the `/admin` route reach 10–60 seconds per page load, with HMR taking 10–20 seconds. On Next.js versions 15.5.4+ and 16.x, multiple users report compilation degrading to the point of unusability (3 GB RAM consumption, 104-second `/admin` load times).

**Why it happens:** Payload server modules are bundled as part of the normal Next.js compilation cycle unless the `bundleServerPackages: false` (or equivalent Turbopack `serverExternalPackages`) option is set. Without this, Next.js attempts to tree-shake all of Payload's server-side code during each rebuild.

**Warning signs:**
- First load of `/admin` takes >20 seconds in dev
- Console shows `Compiled /admin in Xs` with very large X
- RAM spikes 40%+ when `next dev` starts
- HMR changes to non-Payload components are slow

**Prevention strategy:**
In `next.config.ts`, after wrapping with `withPayload`:
```ts
const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['payload', '@payloadcms/next'],
  },
  // For Turbopack (Next.js 16):
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
}
```
Also update the dev script:
```json
"dev": "next dev --turbo"
```
Turbopack is the primary performance fix; this has been default since `create-payload-app` v3.28.0.

**Phase:** Integration setup (Phase 1) / optimization pass.

**Source:** [Payload performance docs](https://payloadcms.com/docs/performance/overview), [GitHub discussion #14230](https://github.com/payloadcms/payload/discussions/14230)
**Confidence:** HIGH

---

### Pitfall 8: Local Filesystem Media Storage Lost on Container Redeploy

**What goes wrong:** The project spec calls for local filesystem media storage. When deployed in a Docker container (Coolify / Hetzner), all files uploaded to `/public/media` or equivalent are stored inside the container's ephemeral filesystem. On redeploy, container replacement destroys all uploaded media files. Uploaded images referenced in the database become 404s.

**Why it happens:** Local filesystem storage is appropriate only for local development. It requires a persistent volume mount to survive container restarts/replacements.

**Warning signs:**
- Images work in staging immediately after deployment but 404 after the next redeploy
- Media count in Payload admin doesn't match visible images on the site
- Docker logs show no volume mount for the media directory

**Prevention strategy:**
Two options:
1. **Persistent Docker volume** (acceptable for a low-traffic landing page): Mount `./media` as a Docker volume in `docker-compose.yml` or the Coolify service config. The volume persists across container replacements.
   ```yaml
   volumes:
     - payload-media:/app/public/media
   volumes:
     payload-media:
   ```
2. **Object storage plugin** (preferred for production reliability): Use `@payloadcms/storage-s3` or `@payloadcms/storage-uploadthing` to store media outside the container. This is the production-safe path.

For the initial integration phase, document this as a known limitation and defer the object storage migration to a dedicated phase.

**Phase:** Phase 2 (content model) — document the constraint. Phase 3 (production deployment) — implement persistent volume or object storage.

**Source:** [GitHub discussion #7251](https://github.com/payloadcms/payload/discussions/7251), [Payload production deployment docs](https://payloadcms.com/docs/production/deployment), [Community: cant access media after rebuild](https://payloadcms.com/community-help/discord/cant-access-media-after-rebuild)
**Confidence:** HIGH

---

### Pitfall 9: Hook Infinite Loops When Calling `payload.update()` on the Same Collection

**What goes wrong:** In `afterChange` or `afterRead` hooks, calling `payload.update()` on the same document that triggered the hook creates a recursive cycle. Each `update` triggers another read, which re-fires the hook, which triggers another update. This hangs the request and can cause the server to crash or OOM.

**Why it happens:** Easy mistake when trying to compute and save derived fields (e.g., auto-generating a slug, computing reading time) in a post-change hook.

**Warning signs:**
- Request hangs indefinitely on document save in admin
- Node process memory climbs continuously after a save
- Logs show the same hook firing multiple times for a single user action

**Prevention strategy:**
Use the `context` guard pattern:
```ts
afterChange: [
  async ({ doc, req }) => {
    if (req.context.skipDerivedUpdate) return doc
    await req.payload.update({
      collection: 'posts',
      id: doc.id,
      data: { slug: generateSlug(doc.title) },
      context: { skipDerivedUpdate: true },  // Break the cycle
    })
    return doc
  }
]
```
For slug generation specifically, use a `beforeValidate` hook instead — it runs before the save and does not trigger another save cycle.

**Phase:** Content model implementation (Phase 2).

**Source:** [Payload context docs](https://payloadcms.com/docs/hooks/context), [dFlow Tips & Tricks](https://dflow.sh/blog/payloadcms-tips-and-tricks), [GitHub discussion #816](https://github.com/payloadcms/payload/discussions/816)
**Confidence:** HIGH

---

### Pitfall 10: `schemaName` Not Auto-Creating the PostgreSQL Schema

**What goes wrong:** When using `postgresAdapter({ schemaName: 'payload' })` to isolate Payload's tables in a dedicated Postgres schema (good practice when sharing a Supabase instance), Payload does not automatically create the schema. If the schema does not pre-exist in the database, migrations fail silently or with a cryptic error:
```
schema "payload" does not exist
```

**Why it happens:** Payload delegates schema creation to Drizzle, which assumes the target schema already exists.

**Warning signs:**
- First-time `migrate:run` fails immediately before creating any tables
- `push: true` in dev appears to work but tables appear in `public` schema, not the configured one

**Prevention strategy:**
Manually create the schema in Supabase before running the first migration:
```sql
CREATE SCHEMA IF NOT EXISTS payload;
```
Add this to your project's setup documentation and CI database initialization step. For Supabase, this can be done via the SQL editor or an initial migration file that runs `CREATE SCHEMA` before Payload's generated migrations.

**Phase:** Integration setup (Phase 1) — database provisioning step.

**Source:** [GitHub issue #5822](https://github.com/payloadcms/payload/issues/5822), [Payload Postgres docs](https://payloadcms.com/docs/database/postgres)
**Confidence:** HIGH

---

### Pitfall 11: `middleware.ts` Cannot Import Payload (Edge Runtime Incompatibility)

**What goes wrong:** Next.js `middleware.ts` runs in the Edge runtime by default. Payload's local API uses Node.js-only modules (`fs`, `crypto`, `path`, etc.). Importing anything from `payload` in `middleware.ts` causes:
```
Module build failed: UnhandledSchemeError: Reading from 'node:os' is not handled by plugins
```
This also affects any authentication check that tries to verify a Payload JWT inside middleware.

**Why it happens:** Developers naturally reach for `payload.auth()` in middleware for route protection, not realizing the Edge runtime constraint.

**Warning signs:**
- Build error mentioning `node:` protocol imports in middleware
- `Cannot use import from 'payload'` errors during build
- Authentication checks that worked in page components fail in middleware

**Prevention strategy:**
Do not import Payload in `middleware.ts`. Options:
1. Move auth logic to a server component layout (runs in Node.js runtime, full Payload access).
2. Use Next.js 15.5+ Node.js middleware runtime if available (`export const runtime = 'nodejs'` in middleware — note: requires Next.js 15.5+).
3. Verify JWTs manually in middleware using `jose` (pure JS JWT library) without calling Payload's local API.

**Phase:** Integration setup (Phase 1) — catch this if any existing middleware.ts is present.

**Source:** [GitHub issue #6970](https://github.com/payloadcms/payload/issues/6970), [Community help: middleware node error](https://payloadcms.com/community-help/github/having-trouble-using-payload-cms-3-with-nextjs-middleware-node-error)
**Confidence:** HIGH

---

## Minor Pitfalls

Mistakes that cause friction but are straightforward to fix.

---

### Pitfall 12: Migration Files Must Be Committed to Git

**What goes wrong:** Developers add `src/migrations/` to `.gitignore` (treating them like build artifacts) or omit them when committing. CI/CD environments have no migration files and cannot run `payload migrate`, causing the database to be out of sync with the application code.

**Prevention strategy:**
- Never gitignore the `migrations` directory.
- Treat migration files like application code: review them in PRs.
- Add `npx payload migrate` as a step in the CI/CD deployment pipeline, before starting the server.
- If a migration needs to be reversed, create a new migration — never edit a committed one.

**Phase:** Content model implementation (Phase 2) — establish the migration workflow before creating collections.

**Source:** [Community: usual process for production schema changes](https://payloadcms.com/community-help/discord/usual-process-to-change-payload-config-database-schema-in-production)
**Confidence:** HIGH

---

### Pitfall 13: Weak or Reused `PAYLOAD_SECRET`

**What goes wrong:** Using a predictable or shared `PAYLOAD_SECRET` (e.g., the same value as `SUPABASE_JWT_SECRET`, or a short string like `"mysecret"`) compromises all Payload-issued JWT tokens. An attacker who knows or can brute-force the secret can forge admin authentication tokens.

**Prevention strategy:**
- Generate a cryptographically random secret: `openssl rand -base64 32`
- Store it exclusively in environment variables, never in source code or shared `.env` files
- Use a distinct secret from any other service in the project
- Never rotate it without a coordinated redeploy (rotation invalidates all active sessions)

**Phase:** Integration setup (Phase 1).

**Source:** [Payload production deployment docs](https://payloadcms.com/docs/production/deployment)
**Confidence:** HIGH

---

### Pitfall 14: Access Control Defaults Are Restrictive (Not Open)

**What goes wrong:** The opposite of what most developers expect: Payload defaults to **requiring authentication** for all collection read/write operations. Public blog posts and knowledge base articles will return 401 to unauthenticated visitors unless read access is explicitly opened.

**Why it happens:** Developers test the admin panel (where they are authenticated) and assume the API works. Public visitors hit the REST or GraphQL API and receive 401 errors. The mistake surfaces at QA time, not during initial development.

**Warning signs:**
- Blog post pages return empty data or 401 in production
- `fetch('/api/posts')` from the frontend returns `{ errors: [...] }` instead of data
- Content appears in admin but not on the site

**Prevention strategy:**
For public collections (blog posts, knowledge base, authors, categories), explicitly set:
```ts
access: {
  read: () => true,   // Anyone can read published content
  create: isAdmin,    // Only admins can create
  update: isAdmin,
  delete: isAdmin,
},
```
This is the first thing to verify after creating each public-facing collection.

**Phase:** Content model implementation (Phase 2).

**Source:** [Payload access control docs](https://payloadcms.com/docs/access-control/overview)
**Confidence:** HIGH

---

### Pitfall 15: Lexical Rich Text Rendering Requires Specific Serializer Import Path

**What goes wrong:** The `@payloadcms/richtext-lexical` package provides both server and client rendering utilities. Importing `RichText` from the React export path in server components (or vice versa) causes hydration mismatches or build failures. The `RenderLexical` server component is marked experimental and may change in minor releases.

**Warning signs:**
- Hydration errors in the browser console when rendering rich text content
- `Unknown file extension ".css"` when importing the component into payload.config
- Rich text blocks render on server but are empty on client

**Prevention strategy:**
- For rendering Lexical content in landing page components (React Server Components), use the HTML converter path, not the React component:
  ```ts
  import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
  ```
- Do not import `RenderLexical` or `RichText` inside `payload.config.ts` — use component paths.
- Pin `@payloadcms/richtext-lexical` to the same version as `payload` (they should always match).

**Phase:** Content model implementation (Phase 2) / frontend integration (Phase 3).

**Source:** [GitHub issue #10708](https://github.com/payloadcms/payload/issues/10708), [Payload rich text rendering docs](https://payloadcms.com/docs/rich-text/rendering-on-demand)
**Confidence:** MEDIUM (specifics of stable vs experimental API not fully verified for v3.73+)

---

## Phase-Specific Warnings Summary

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| Phase 1: Integration setup | Route group restructure | Root layout wraps admin — styles bleed (Pitfall 3) | Move existing routes to `(marketing)/` before Payload install |
| Phase 1: Integration setup | Version pinning | Next.js `latest` ahead of Payload's compatibility window (Pitfall 4) | Pin Next.js to `>=16.2.0`, Payload to `>=3.73.0` |
| Phase 1: Integration setup | Database provisioning | `schemaName` not auto-created in Supabase (Pitfall 10) | Run `CREATE SCHEMA IF NOT EXISTS payload` manually first |
| Phase 1: Integration setup | Config purity | Client imports in payload.config.ts break CLI and builds (Pitfall 1) | Use component path strings, never direct imports |
| Phase 1: Integration setup | Migration mode | `push: true` causes schema drift and known PostgreSQL bug (Pitfall 2) | Set `push: false` from day one |
| Phase 1: Integration setup | next.config.ts | `withPayload` merging conflict with Tailwind v4 PostCSS (Pitfall 5) | Test build immediately after wrapping |
| Phase 1: Integration setup | tsconfig | Missing `@payload-config` path alias (Pitfall 6) | Add alias before first `generate:types` run |
| Phase 1: Integration setup | Secrets | Weak `PAYLOAD_SECRET` (Pitfall 13) | Generate with `openssl rand -base64 32` |
| Phase 2: Content modeling | Hooks | Infinite loop on self-referencing `payload.update()` (Pitfall 9) | Always use context guard pattern |
| Phase 2: Content modeling | Access control | Public collections default to auth-required (Pitfall 14) | Set `read: () => true` on all public collections |
| Phase 2: Content modeling | Migrations | Migration files gitignored (Pitfall 12) | Commit all files in `src/migrations/` |
| Phase 3: Production deploy | Media storage | Container redeploy destroys uploaded files (Pitfall 8) | Docker volume or object storage plugin |
| Phase 3: Production deploy | Performance | Dev server slow compilation without Turbopack (Pitfall 7) | `next dev --turbo`, `serverComponentsExternalPackages` |
| Phase 3: Production deploy | Middleware | Auth logic in middleware.ts fails in Edge runtime (Pitfall 11) | Move auth to layout server components |
| Phase 3+: Frontend integration | Rich text | Wrong import path for Lexical renderer (Pitfall 15) | Use HTML converter for RSC, never in config |

---

## Sources

- [Payload CMS Documentation: Postgres](https://payloadcms.com/docs/database/postgres) — HIGH confidence
- [Payload CMS Documentation: Migrations](https://payloadcms.com/docs/database/migrations) — HIGH confidence
- [Payload CMS Documentation: Access Control](https://payloadcms.com/docs/access-control/overview) — HIGH confidence
- [Payload CMS Documentation: Admin CSS Customization](https://payloadcms.com/docs/admin/customizing-css) — HIGH confidence
- [Payload CMS Documentation: Production Deployment](https://payloadcms.com/docs/production/deployment) — HIGH confidence
- [Payload CMS Documentation: Hooks Context](https://payloadcms.com/docs/hooks/context) — HIGH confidence
- [Payload CMS Documentation: Performance](https://payloadcms.com/docs/performance/overview) — HIGH confidence
- [Payload CMS Documentation: TypeScript](https://payloadcms.com/docs/typescript/overview) — HIGH confidence
- [GitHub issue #14035: push mode serial type error](https://github.com/payloadcms/payload/issues/14035) — HIGH confidence
- [GitHub issue #14354: withPayload Turbopack conflict](https://github.com/payloadcms/payload/issues/14354) — HIGH confidence
- [GitHub issue #8878: Tailwind breaks admin styling](https://github.com/payloadcms/payload/issues/8878) — HIGH confidence
- [GitHub issue #6970: Node modules in middleware](https://github.com/payloadcms/payload/issues/6970) — HIGH confidence
- [GitHub issue #5822: schemaName not created](https://github.com/payloadcms/payload/issues/5822) — HIGH confidence
- [GitHub issue #15429: config null in RSC production build](https://github.com/payloadcms/payload/issues/15429) — MEDIUM confidence (open, unresolved)
- [GitHub discussion #14330: Next.js 16 + Turbopack support](https://github.com/payloadcms/payload/discussions/14330) — HIGH confidence
- [GitHub discussion #7251: media lost after Docker rebuild](https://github.com/payloadcms/payload/discussions/7251) — HIGH confidence
- [buildwithmatija.com: Next.js 16 compatibility](https://www.buildwithmatija.com/blog/payload-cms-nextjs-16-compatibility-breakthrough) — MEDIUM confidence (community blog, cross-referenced with GitHub)
- [buildwithmatija.com: Push to migrations guide](https://www.buildwithmatija.com/blog/payloadcms-postgres-push-to-migrations) — MEDIUM confidence (community blog, aligned with official docs)
- [dFlow: PayloadCMS Tips and Tricks](https://dflow.sh/blog/payloadcms-tips-and-tricks) — MEDIUM confidence (community blog, patterns confirmed against official docs)
