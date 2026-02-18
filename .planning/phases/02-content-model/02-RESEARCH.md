# Phase 2: Content Model - Research

**Researched:** 2026-02-18
**Domain:** Payload CMS 3.77.0 collection definitions, editorial workflow (drafts/versions/live-preview/scheduled-publishing), SEO plugin
**Confidence:** HIGH (most findings verified against Payload type definitions in node_modules and official Payload website template source)

---

## Summary

This research covers what is needed to implement Phase 2: defining all Payload CMS collections (Posts, Authors, Categories, KnowledgeBase) plus the editorial workflow (draft/publish, version history, live preview, scheduled publishing) and SEO plugin configuration.

Phase 1 is fully complete. The project has `payload.config.ts` at the project root, `src/collections/Users.ts` and `src/collections/Media.ts` already registered, `push: false` and migration tracking in place. Phase 2 only adds new collections and plugins to the existing working Payload installation — no infrastructure changes are needed.

All editorial workflow features (drafts, version history, live preview, scheduled publishing) are **built into Payload core at 3.77.0** and require only config changes, not additional packages. The one exception is `@payloadcms/plugin-seo@3.77.0` which needs to be installed. The `slugField` utility is built into `payload` core and can be imported directly.

**Primary recommendation:** Follow the Payload website template's Posts collection pattern closely (it uses all required features: slugField, versions with drafts+autosave+schedulePublish, live preview, SEO plugin). Adapt it for this project's requirements (no multi-tenant complexity, add noIndex/canonical as custom fields on the SEO plugin, use `section` field on KB articles instead of nested-docs).

---

## Standard Stack

### Core (Already Installed — No New Installs for Editorial Workflow)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `payload` | `3.77.0` | Core CMS — includes versions, drafts, live preview, scheduled publishing | INSTALLED |
| `@payloadcms/richtext-lexical` | `3.77.0` | Lexical rich text editor for post/article body | INSTALLED |
| `@payloadcms/db-postgres` | `3.77.0` | PostgreSQL adapter — creates `_slug_versions` tables automatically | INSTALLED |

### New Installs Required

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@payloadcms/plugin-seo` | `3.77.0` | Adds meta title, description, OG image group to collections | Required for SEO-01, SEO-02, SEO-03, SEO-09, SEO-10 |

### Built-In Payload Utilities (Import from `payload` — No Extra Install)

| Import | Purpose |
|--------|---------|
| `slugField` from `'payload'` | Auto-generates slug from a specified field (e.g., title). Experimental but used in official templates. |
| `lexicalEditor` from `'@payloadcms/richtext-lexical'` | Rich text editor — already configured in payload.config.ts |

### Plugins in Roadmap Plan But Not Required for Phase 2

The ROADMAP.md plan structure mentions `nested-docs` and `search` plugins in 02-02. However:
- **`@payloadcms/plugin-nested-docs`**: Only needed if KB articles have nested parent/child hierarchy. KB-01 only requires "section grouping" — a simple `select` or `relationship` field on the article itself satisfies this without nested-docs.
- **`@payloadcms/plugin-search`**: Only needed if a search index is required for the admin or frontend. The phase goal is "content editors can author posts and KB articles" — no search is in the success criteria. Defer to Phase 3.

**Installation (only the SEO plugin):**
```bash
npm install @payloadcms/plugin-seo@3.77.0 --legacy-peer-deps
```

**Note:** `--legacy-peer-deps` is required because of React 19 peer dep conflicts (same reason as Phase 1 Payload install).

---

## Architecture Patterns

### Recommended Project Structure (After Phase 2)

```
src/
├── collections/
│   ├── Users.ts          ← EXISTING (auth collection)
│   ├── Media.ts          ← EXISTING (upload collection)
│   ├── Authors.ts        ← NEW: author profiles (name, bio, avatar, role)
│   ├── Categories.ts     ← NEW: blog post categories (name, slug)
│   ├── Posts.ts          ← NEW: blog posts with full editorial workflow
│   └── KnowledgeBase.ts  ← NEW: KB articles with section grouping
├── migrations/
│   ├── index.ts          ← EXISTING (must be updated after each migrate:create)
│   └── 20260218_214939.ts ← EXISTING initial migration
└── (new migration files after Phase 2 schema changes)
```

Note: There is no `src/globals/` or `src/fields/` directory needed for Phase 2. The slugField is imported from `payload` directly. No custom field factories are needed.

### Pattern 1: Collection with Full Editorial Workflow

The Payload website template demonstrates the canonical pattern for a publication-ready collection:

```typescript
// Source: Payload website template — Posts collection pattern
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: ({ req }) => {
      // Logged-in users see everything; public only sees published
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL}/blog/${data.slug}`,
    },
    preview: (data) =>
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blog/${data.slug}`,
  },
  versions: {
    maxPerDoc: 50,
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField(),  // spread — returns a RowField with slug + generateSlug checkbox
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor(),
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
```

### Pattern 2: SlugField Usage

`slugField` is a built-in Payload 3.x field that auto-generates a slug from another field. It is **experimental** but used in official Payload templates.

```typescript
// Source: payload/dist/index.bundled.d.ts — verified SlugFieldArgs type
import { slugField } from 'payload'

// Default usage: generates slug from 'title' field, adds lock/unlock checkbox
...slugField()

// Custom options:
...slugField({
  useAsSlug: 'title',     // field to derive slug from (default: 'title')
  name: 'slug',           // override the slug field name (default: 'slug')
  required: true,         // slug is required (default: true)
})
```

`slugField()` returns a **`RowField`** (a row containing two fields: the slug text field and a "generateSlug" checkbox). It must be spread into the fields array with `...slugField()`, not pushed as a single element.

### Pattern 3: Version Config

```typescript
// Source: payload/dist/versions/types.d.ts — IncomingCollectionVersions
versions: {
  maxPerDoc: 50,   // Keep 50 version snapshots per document (default: 100)
  drafts: {
    autosave: {
      interval: 100,   // Autosave every 100ms (debounced)
    },
    schedulePublish: true,   // Enable future publishing picker in admin
    validate: false,          // Don't validate on draft saves (default: false)
  },
},
```

The `_status` field is automatically injected by Payload when `drafts` is enabled. It takes values `'draft'` or `'published'`.

### Pattern 4: Access Control for Draft Collections

```typescript
// Source: payloadcms.com/docs/versions/drafts
access: {
  read: ({ req }) => {
    if (req.user) return true  // Authenticated: see all including drafts
    return {
      _status: { equals: 'published' }  // Public: only published
    }
  },
  create: ({ req }) => Boolean(req.user),
  update: ({ req }) => Boolean(req.user),
  delete: ({ req }) => Boolean(req.user),
  readVersions: ({ req }) => Boolean(req.user),  // Only auth users see version history
},
```

### Pattern 5: SEO Plugin Configuration

```typescript
// Source: payloadcms.com/docs/plugins/seo + github.com/payloadcms/plugin-seo types.ts
import { seoPlugin } from '@payloadcms/plugin-seo'

// In payload.config.ts plugins array:
seoPlugin({
  collections: ['posts', 'knowledge-base'],
  uploadsCollection: 'media',
  tabbedUI: true,          // Adds an "SEO" tab in the editor (cleaner UX)
  generateTitle: ({ doc }) =>
    doc.title ? `${doc.title} | PackBee` : 'PackBee',
  generateDescription: ({ doc }) =>
    doc.excerpt || '',
  generateURL: ({ doc, collectionSlug }) =>
    collectionSlug === 'posts'
      ? `${process.env.NEXT_PUBLIC_SERVER_URL}/blog/${doc.slug}`
      : `${process.env.NEXT_PUBLIC_SERVER_URL}/help/${doc.slug}`,
  fields: [
    // Extend default fields (title, description, image) with canonical + noIndex
    {
      name: 'canonicalURL',
      type: 'text',
      label: 'Canonical URL',
      admin: {
        description: 'Override the canonical URL for this page. Leave blank to use the default URL.',
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      label: 'No Index',
      defaultValue: false,
      admin: {
        description: 'Check to exclude this page from search engine indexing and the sitemap.',
      },
    },
  ],
})
```

**What the SEO plugin injects:** A `meta` field group (or tab if `tabbedUI: true`) with:
- `meta.title` — SEO title text field
- `meta.description` — SEO description textarea
- `meta.image` — Upload relationship to the uploads collection (OG image)
- `meta.canonicalURL` — custom field for canonical URL (SEO-09)
- `meta.noIndex` — custom checkbox for noIndex (SEO-10)

**Note on OG title (SEO-03):** The SEO plugin does not add a separate OG title field by default. The `meta.title` field serves as both the `<title>` and `og:title`. To have a separate OG title override, add another custom field via `fields`:
```typescript
{
  name: 'ogTitle',
  type: 'text',
  label: 'OG Title Override',
  admin: {
    description: 'Override the social sharing title. Defaults to SEO Title if blank.',
  },
},
```

### Pattern 6: Live Preview Configuration

Live Preview is configured in `admin.livePreview` on a collection or globally in `payload.config.ts`.

```typescript
// Source: payload/dist/config/types.d.ts — LivePreviewConfig + RootLivePreviewConfig
// Option A: Per-collection (in the collection's admin config)
admin: {
  livePreview: {
    url: ({ data }) =>
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blog/${data.slug}`,
    breakpoints: [
      { name: 'mobile', label: 'Mobile', width: 375, height: 667 },
      { name: 'desktop', label: 'Desktop', width: 1280, height: 900 },
    ],
  },
},

// Option B: Global root config (applies to multiple collections/globals)
// In payload.config.ts:
admin: {
  livePreview: {
    collections: ['posts', 'knowledge-base'],
    url: ({ data, collectionConfig }) => {
      if (collectionConfig?.slug === 'posts') {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/blog/${data.slug}`
      }
      return `${process.env.NEXT_PUBLIC_SERVER_URL}/help/${data.slug}`
    },
  },
},
```

**Important:** Live Preview renders the frontend URL in an iframe. For Phase 2, there are no public frontend routes yet (those are Phase 3). Live Preview will not render meaningful content until Phase 3, but the configuration can be added now. The live preview button will appear in the admin, and once Phase 3 routes exist, it will work automatically.

**Alternative:** Use `admin.preview` (not `admin.livePreview`) as a simple link button to open the preview URL in a new tab — no iframe, no postMessage. This is simpler but does not satisfy EDIT-03 which specifically says "Live Preview in admin panel."

### Pattern 7: Scheduled Publishing (Jobs Queue)

`schedulePublish: true` in the `versions.drafts` config enables the date/time picker in the admin UI. Payload automatically creates a job in its internal `payload-jobs` collection when an editor schedules a publish.

**To process the jobs, the Payload app must run jobs.** The `autoRun` config in `jobs` config enables cron-based job processing:

```typescript
// Source: payload/dist/queues/config/types/index.d.ts — JobsConfig + AutorunCronConfig
// In payload.config.ts buildConfig():
jobs: {
  autoRun: [
    {
      cron: '* * * * *',    // Run every minute
      queue: 'default',
      limit: 10,
    },
  ],
},
```

**Critical caveat:** The `autoRun` config doc comment states: "this property should not be used on serverless platforms like Vercel." This project uses Hetzner via Coolify (a dedicated server), so `autoRun` with a cron interval is appropriate and will work.

For Next.js on a dedicated server, `autoRun` initializes via Payload's `cron` init option. The Next.js server process must be configured to enable crons:

```typescript
// In the Payload init call (handled internally by @payloadcms/next):
// The cron: true option on the RootLivePreviewConfig is what triggers autoRun
// It is automatically handled when NEXT_PUBLIC_SERVER_URL is set and the server stays up
```

**Verification:** After adding `jobs.autoRun`, run `payload migrate:create` and apply the migration — Payload will add a `payload-jobs` collection to the DB schema.

### Pattern 8: KB Section Grouping

KB-01 requires "section grouping" for knowledge base articles. The simplest approach is a `select` field with predefined sections, or a relationship to a `Sections` collection. Given the phase goal (content editors can create and publish articles), a `select` field is simpler and avoids an extra collection:

```typescript
// Simple select approach for KB section grouping
{
  name: 'section',
  type: 'select',
  required: true,
  options: [
    { label: 'Getting Started', value: 'getting-started' },
    { label: 'Account & Billing', value: 'account-billing' },
    { label: 'Integrations', value: 'integrations' },
    { label: 'Troubleshooting', value: 'troubleshooting' },
  ],
},
```

**Alternative:** If KB sections need their own slugs, descriptions, and ordering for Phase 3 frontend routes (`/help/[section-slug]`), a `Sections` collection (similar to Categories) would be needed. Phase 3 requires `/help/[section-slug]` pages — this means sections need slugs. A `Sections` collection is therefore the right choice, not a `select` field. See Open Questions.

### Anti-Patterns to Avoid

- **Do not use `push: true` when adding new collections.** The project uses `push: false`. After adding collections to `payload.config.ts`, always run `npx payload migrate:create --name <description>` then `npx payload migrate`.
- **Do not add `_status` manually.** Payload injects it automatically when `drafts` is enabled. Manually adding it causes a conflict.
- **Do not use `...slugField` (without spread operator).** `slugField()` returns a `RowField`. Use `...slugField()` (spread) in the fields array.
- **Do not mix `admin.livePreview` URL for a collection that doesn't have a public route yet.** Live preview will show a 404 iframe in Phase 2. This is acceptable — configure it now, it will work once Phase 3 routes exist.
- **Do not import from `@payloadcms/plugin-seo` before installing it.** Currently not installed. Install first, then add to config.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slug auto-generation from title | Custom `beforeValidate` hook + slugify function | `slugField()` from `'payload'` | Built-in Payload 3.x, has lock/unlock UX, handles autosave edge cases |
| Draft/publish workflow | Custom `status` field + access control | `versions.drafts: true` in collection config | Built-in — adds `_status`, Publish/Save Draft buttons, version history table |
| Version history UI | Custom version tracking table | `versions: { maxPerDoc: N }` | Payload creates `_slug_versions` table automatically and shows history in admin |
| Scheduled publishing | Cron job outside Payload | `versions.drafts.schedulePublish: true` + `jobs.autoRun` | Built-in Payload jobs system; admin shows date picker and manages queue |
| SEO meta fields | Custom `meta` group with title/description/image | `@payloadcms/plugin-seo@3.77.0` | Has character counters, auto-generate buttons, search preview — more than a text field |
| Canonical URL + noIndex | Separate collection or complex plugin | `fields: [...]` in seoPlugin config | The plugin's `fields` array merges custom fields into the `meta` group |
| OG title override | Separate collection | `fields: [{ name: 'ogTitle', type: 'text' }]` in seoPlugin config | Same mechanism as canonical/noIndex |
| Author bio/avatar | Adding fields to Users collection | Separate `Authors` collection | Keeps auth users (admin accounts) separate from author profiles |

**Key insight:** Almost everything in Phase 2 is configuration, not code. Payload 3.x editorial workflow is nearly entirely declarative via `versions`, `drafts`, and `schedulePublish` in the collection config.

---

## Common Pitfalls

### Pitfall 1: Forgetting `migrate:create` After Every Config Change

**What goes wrong:** Adding a new collection or field to `payload.config.ts` does not update the database. With `push: false`, no schema change happens until a migration is created and run. Running the dev server against an out-of-sync schema causes Drizzle errors.

**Why it happens:** Developers coming from `push: true` workflows forget the manual migration step.

**How to avoid:** After every round of collection additions, immediately run:
```bash
npx payload migrate:create --name phase-2-collections
npx payload migrate
```

**Warning signs:** Drizzle error in the dev server console mentioning missing columns or tables.

### Pitfall 2: `...slugField()` Not Spread Correctly

**What goes wrong:** `slugField()` returns a `RowField` object (a row containing two fields: slug + checkbox). Passing it directly (not spread) adds a RowField as a single element, which is valid but results in unexpected nesting. Spreading it is the correct pattern per official templates.

**Why it happens:** Developers add `slugField()` (without spread) thinking it returns a single TextField.

**How to avoid:** Always use `...slugField()` in the fields array:
```typescript
fields: [
  { name: 'title', type: 'text', required: true },
  ...slugField(),   // Correct: spread a RowField
]
```

### Pitfall 3: SEO Plugin Version Mismatch

**What goes wrong:** Installing `@payloadcms/plugin-seo` at the latest version (e.g., `3.80.0`) while all other `@payloadcms/*` packages are at `3.77.0` causes runtime errors. The locked constraint applies to ALL `@payloadcms/*` packages.

**Why it happens:** Running `npm install @payloadcms/plugin-seo` without a version pin installs latest.

**How to avoid:** Always pin: `npm install @payloadcms/plugin-seo@3.77.0 --legacy-peer-deps`

**Verification:** After install, check `package.json` shows `"@payloadcms/plugin-seo": "3.77.0"` exactly.

### Pitfall 4: `schedulePublish` Without `jobs.autoRun` Config

**What goes wrong:** Setting `schedulePublish: true` in the collection config enables the date picker in admin. The editor can schedule a publish. But the job will never execute because there is no job runner configured. Scheduled publishes silently fail.

**Why it happens:** The UI shows "Scheduled" status and the job is queued — but nothing processes the queue.

**How to avoid:** Add `jobs.autoRun` config to `payload.config.ts` alongside enabling `schedulePublish`.

**Warning signs:** Document stays in "Scheduled" state past its scheduled time.

### Pitfall 5: Live Preview URL Returns 404 in Phase 2

**What goes wrong:** `admin.livePreview.url` points to `/blog/[slug]` or `/help/[slug]` which don't exist until Phase 3. The live preview iframe shows a 404 error in Phase 2.

**Why it happens:** The URL is configured correctly but the routes don't exist yet.

**How to avoid:** This is expected behavior in Phase 2. The success criterion for EDIT-03 is "Live Preview in admin panel" — the configuration should be in place. Document this limitation in the plan. The 404 iframe is acceptable and will resolve in Phase 3.

### Pitfall 6: Migration File Index Not Updated

**What goes wrong:** Running `payload migrate:create` generates a new migration file in `src/migrations/` but does NOT automatically update `src/migrations/index.ts`. If the index file is not updated to import the new migration, `payload migrate` cannot find and run it.

**Why it happens:** The `migrate:create` CLI creates the migration file but the index update is manual (or the CLI updates it — this needs verification at implementation time).

**How to avoid:** After each `migrate:create`, check `src/migrations/index.ts` and verify the new migration is imported and exported. If not, add it manually:
```typescript
import * as migration_20260219_phase2 from './20260219_phase2'
export const migrations = [migration_20260218_214939, migration_20260219_phase2]
```

**Note:** Based on the Phase 1 implementation, the `index.ts` file was present with the initial migration. Verify whether `migrate:create` auto-updates it in the Payload 3.77.0 CLI.

### Pitfall 7: Authors vs Users Collection Confusion

**What goes wrong:** Using the `Users` collection (auth: true) as the Authors collection means every author profile is also an admin account with login credentials.

**Why it happens:** It seems simpler to have one collection.

**How to avoid:** Create a separate `Authors` collection for editorial author profiles (name, bio, avatar, role). Link posts via `relationship` to `authors`. The `Users` collection remains the admin login collection. This matches BLOG-02 which specifies "Author profiles collection" as separate from users.

---

## Code Examples

Verified patterns from official sources (type definitions + website template):

### Complete Authors Collection

```typescript
// Source: Payload website template Users collection pattern, adapted for Authors
// File: src/collections/Authors.ts
import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
  slug: 'authors',
  access: {
    read: () => true,   // Public read — author bios shown on frontend
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
```

### Complete Categories Collection

```typescript
// Source: Payload website template Categories.ts (verified)
// File: src/collections/Categories.ts
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField(),
  ],
}
```

### Versions Config Shape (from type definitions)

```typescript
// Source: payload/dist/versions/types.d.ts — IncomingCollectionVersions
versions: {
  maxPerDoc: 50,
  drafts: {
    autosave: {
      interval: 100,           // ms — debounce interval for autosave
      showSaveDraftButton: true, // Show "Save Draft" even when autosave is on
    },
    schedulePublish: true,     // Enable date picker for future publish
    validate: false,           // Skip required field validation on draft save
  },
} satisfies IncomingCollectionVersions
```

### SEO Plugin with Custom Fields (verified plugin-seo types.ts)

```typescript
// Source: github.com/payloadcms/plugin-seo/blob/main/src/types.ts
// PluginConfig.fields is Field[] — extends the meta group fields
seoPlugin({
  collections: ['posts', 'knowledge-base'],
  uploadsCollection: 'media',
  tabbedUI: true,
  generateTitle: ({ doc }) => doc.title ? `${doc.title} | PackBee` : 'PackBee',
  generateDescription: ({ doc }) => doc.excerpt ?? '',
  generateURL: ({ doc, collectionSlug }) =>
    collectionSlug === 'posts'
      ? `${process.env.NEXT_PUBLIC_SERVER_URL}/blog/${doc.slug}`
      : `${process.env.NEXT_PUBLIC_SERVER_URL}/help/${doc.slug}`,
  fields: [
    { name: 'canonicalURL', type: 'text', label: 'Canonical URL' },
    { name: 'ogTitle', type: 'text', label: 'OG Title Override' },
    { name: 'noIndex', type: 'checkbox', label: 'No Index', defaultValue: false },
  ],
})
```

### Jobs Config for Scheduled Publishing (verified from type definitions)

```typescript
// Source: payload/dist/queues/config/types/index.d.ts — JobsConfig.autoRun
// Add to buildConfig() in payload.config.ts:
jobs: {
  autoRun: [
    {
      cron: '* * * * *',     // Every minute
      queue: 'default',
      allQueues: false,
      limit: 10,
    },
  ],
  deleteJobOnComplete: true,  // Clean up completed jobs
},
```

### Access Control Helper Pattern

```typescript
// Reusable access helpers (can be inline lambdas or small utility functions)
const isAuthenticated = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)
const publishedOnly = ({ req }: { req: { user?: unknown } }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom `status` select field + manual hooks | `versions.drafts: true` — injects `_status` automatically | Payload v1 → v2 | No manual status field needed |
| `beforeValidate` hook for slug generation | `slugField()` from `'payload'` | Payload v3 | Built-in with lock/unlock UX |
| Manual version table in custom collection | `versions: { maxPerDoc: N }` — auto-creates `_slug_versions` table | Payload v2 | Zero code, just config |
| External cron service for scheduled publish | `schedulePublish: true` + `jobs.autoRun` in `payload.config.ts` | Payload v3 (jobs queue) | Built-in — admin has date picker |
| Separate SEO plugin package (plugin-seo v1) | `@payloadcms/plugin-seo` (now maintained under payloadcms org) | Moved to monorepo | Must pin at 3.77.0, same version as other packages |

**Note on `slugField` experimental status:** The type definition comment explicitly says: "This field is experimental and may change or be removed in the future. Use at your own risk." The official Payload website template uses it, so it is considered stable enough for production use in 3.x. If it breaks, the fallback is a manual `beforeValidate` hook — but this is unlikely at 3.77.0.

---

## Open Questions

### 1. KB Section Grouping: `select` Field vs `Sections` Collection

**What we know:** KB-01 requires "section grouping." Phase 3 requires `/help/[section-slug]` routes, meaning sections need their own slugs.

**What's unclear:** The ROADMAP does not specify whether a `Sections` collection or a `select` field satisfies KB-01 for Phase 2.

**Recommendation:** Create a `Sections` collection (name + slug) now in Phase 2, analogous to `Categories`. This avoids a schema change in Phase 3. A `Sections` collection requires one extra migration but future-proofs the data model. The `select` field approach would require a schema change in Phase 3 to migrate to a relationship field.

**Decision needed:** This should be a planner decision. Lean toward `Sections` collection.

### 2. Whether `migrate:create` Auto-Updates `src/migrations/index.ts`

**What we know:** Phase 1 ended with `src/migrations/index.ts` manually maintained. The Payload CLI documentation says `migrate:create` creates the migration file.

**What's unclear:** Whether the Payload 3.77.0 CLI automatically updates the index file after `migrate:create`, or whether it must be done manually.

**Recommendation:** The plan should include an explicit step: "after `migrate:create`, verify `src/migrations/index.ts` imports the new migration. If not, add it manually." This is a low-risk step to include regardless.

### 3. Live Preview Frontend Integration in Phase 2

**What we know:** Live Preview uses `window.postMessage` to send document data to a frontend app in an iframe. For Phase 2, there are no public frontend routes, so the iframe will show a 404.

**What's unclear:** Whether the success criterion for EDIT-03 ("Live Preview in admin panel") means the live preview button must show real content in Phase 2, or just that the configuration is in place.

**Recommendation:** Configure live preview in Phase 2 (button appears, iframe loads, 404 is acceptable). The success criteria says "previewed live in the admin panel" which requires real content (Phase 3 route). The planner should note that EDIT-03 is partially satisfied in Phase 2 (config in place) and fully satisfied when Phase 3 routes exist. This is fine — the phase success criteria focus on the admin editorial experience, not rendering.

### 4. `generateSlug` Checkbox Behavior with Autosave

**What we know:** `slugField()` adds a "Generate Slug" checkbox alongside the slug text field. When `autosave` is enabled with a short interval (100ms), the slug might regenerate on every autosave if the checkbox is checked.

**What's unclear:** The type definition says: "The slug should stabilize after all above criteria have been met, because the URL is typically derived from the slug. This is to protect modifying potentially live URLs, breaking links, etc. without explicit intent." The stabilization logic is built-in.

**Recommendation:** Use the default `slugField()` behavior. The built-in stabilization logic handles autosave correctly. No workaround needed.

---

## Sources

### Primary (HIGH confidence)

- `payload/dist/collections/config/types.d.ts` (node_modules) — `CollectionConfig`, `CollectionAdminOptions`, `LivePreviewConfig` types
- `payload/dist/versions/types.d.ts` (node_modules) — `IncomingCollectionVersions`, `IncomingDrafts`, `SchedulePublish`, `Autosave` types
- `payload/dist/queues/config/types/index.d.ts` (node_modules) — `JobsConfig`, `AutorunCronConfig` types
- `payload/dist/index.bundled.d.ts` (node_modules) — `slugField`, `SlugFieldArgs` type + docs comment
- `payload/dist/config/types.d.ts` (node_modules) — `LivePreviewConfig`, `RootLivePreviewConfig`
- [Payload website template — Categories.ts](https://github.com/payloadcms/payload/blob/main/templates/website/src/collections/Categories.ts) — verified collection pattern
- [Payload website template — Posts collection](https://github.com/payloadcms/payload/blob/main/templates/website/src/collections/Posts/index.ts) — full editorial workflow pattern
- [github.com/payloadcms/plugin-seo — types.ts](https://github.com/payloadcms/plugin-seo/blob/main/src/types.ts) — `PluginConfig.fields: Field[]` (not a function)
- [npm @payloadcms/plugin-seo](https://www.npmjs.com/package/@payloadcms/plugin-seo) — version 3.77.0 confirmed available

### Secondary (MEDIUM confidence)

- [payloadcms.com/docs/versions/drafts](https://payloadcms.com/docs/versions/drafts) — verified drafts config shape, `_status` field, access control pattern
- [github.com/payloadcms/payload/blob/main/docs/versions/drafts.mdx](https://github.com/payloadcms/payload/blob/main/docs/versions/drafts.mdx) — `schedulePublish` requires jobs queue to be configured
- [github.com/payloadcms/payload/blob/main/docs/live-preview/overview.mdx](https://github.com/payloadcms/payload/blob/main/docs/live-preview/overview.mdx) — `livePreview.url` function shape
- [github.com/payloadcms/plugin-seo/blob/main/src/index.ts](https://github.com/payloadcms/plugin-seo/blob/main/src/index.ts) — plugin injects fields into meta group

### Tertiary (LOW confidence)

- WebSearch results indicating `slugField` auto-generation issues in Payload 3.0 (GitHub issue #7645) — unverified; treat the built-in `slugField()` as the correct approach at 3.77.0

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from installed node_modules type definitions and npm version checks
- Architecture (collection patterns): HIGH — verified against Payload website template source
- Versions/drafts/schedulePublish config: HIGH — verified from type definitions in node_modules
- SEO plugin config: HIGH — verified from plugin-seo types.ts (fields is Field[], not a function)
- Jobs queue for scheduled publishing: MEDIUM — config shape verified from types; runtime behavior on this specific Hetzner/Coolify deployment not tested
- `slugField` behavior with autosave: MEDIUM — type definition docs are clear on stabilization behavior, but "experimental" caveat acknowledged
- KB sections approach: LOW — recommendation (Sections collection) is based on Phase 3 route requirements inferred from ROADMAP, not a locked decision

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (Payload 3.77.0 is pinned, no version drift expected; type definitions are definitive)
