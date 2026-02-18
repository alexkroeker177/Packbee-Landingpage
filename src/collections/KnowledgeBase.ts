import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { revalidateKB } from './hooks/revalidateKB'

export const KnowledgeBase: CollectionConfig = {
  slug: 'knowledge-base',
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    readVersions: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'section', '_status', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/help/${data?.slug ?? ''}`,
    },
    preview: (data) =>
      `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/help/${typeof data === 'object' && data && 'slug' in data ? data.slug : ''}`,
  },
  versions: {
    maxPerDoc: 50,
    drafts: {
      autosave: {
        interval: 100,
      },
    },
  },
  hooks: {
    afterChange: [revalidateKB],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'sections',
      required: true,
      admin: {
        description: 'The knowledge base section this article belongs to.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor(),
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary displayed in search results and used as meta description fallback.',
      },
    },
    {
      name: 'articleType',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard Article', value: 'standard' },
        { label: 'FAQ Article (FAQPage schema)', value: 'faq' },
      ],
      admin: {
        description: 'Controls structured data (JSON-LD) schema type emitted for search engines.',
        position: 'sidebar',
      },
    },
    {
      name: 'faqs',
      type: 'array',
      admin: {
        description: 'Question and answer pairs for FAQPage structured data. Only used when Article Type is FAQ.',
        condition: (data) => data?.articleType === 'faq',
      },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}
