import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Sections: CollectionConfig = {
  slug: 'sections',
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
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short description shown on the section landing page.',
      },
    },
  ],
}
