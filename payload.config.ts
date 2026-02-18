import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import sharp from 'sharp'

import { Media } from './src/collections/Media'
import { Users } from './src/collections/Users'
import { Authors } from './src/collections/Authors'
import { Categories } from './src/collections/Categories'
import { Sections } from './src/collections/Sections'
import { Posts } from './src/collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Authors, Categories, Sections, Posts],
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
  plugins: [
    seoPlugin({
      collections: ['posts', 'knowledge-base'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) =>
        (doc as Record<string, unknown>)?.title ? `${(doc as Record<string, unknown>).title} | PackBee` : 'PackBee',
      generateDescription: ({ doc }) =>
        (doc as Record<string, unknown>)?.excerpt as string ?? '',
      generateURL: ({ doc, collectionSlug }) =>
        collectionSlug === 'posts'
          ? `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/blog/${(doc as Record<string, unknown>)?.slug ?? ''}`
          : `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/help/${(doc as Record<string, unknown>)?.slug ?? ''}`,
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'canonicalURL',
          type: 'text',
          label: 'Canonical URL',
          admin: {
            description: 'Override the canonical URL for this page. Leave blank to use the default URL.',
          },
        },
        {
          name: 'ogTitle',
          type: 'text',
          label: 'OG Title Override',
          admin: {
            description: 'Override the social sharing title. Defaults to SEO Title if blank.',
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
    }),
  ],
  jobs: {
    autoRun: [
      {
        cron: '* * * * *',
        queue: 'default',
        limit: 10,
      },
    ],
    deleteJobOnComplete: true,
  },
})
