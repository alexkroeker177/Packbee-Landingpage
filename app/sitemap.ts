import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CACHE_TAGS } from '../src/lib/cache-tags'

const getSitemapData = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

    const [posts, kbArticles] = await Promise.all([
      payload.find({
        collection: 'posts',
        overrideAccess: false,
        draft: false,
        limit: 1000,
        pagination: false,
        where: {
          and: [
            { _status: { equals: 'published' } },
            { 'meta.noIndex': { not_equals: true } },
          ],
        },
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'knowledge-base',
        overrideAccess: false,
        draft: false,
        limit: 1000,
        pagination: false,
        where: {
          and: [
            { _status: { equals: 'published' } },
            { 'meta.noIndex': { not_equals: true } },
          ],
        },
        select: { slug: true, updatedAt: true },
      }),
    ])

    return [
      { url: `${SITE_URL}/`, lastModified: new Date().toISOString() },
      { url: `${SITE_URL}/blog`, lastModified: new Date().toISOString() },
      { url: `${SITE_URL}/help`, lastModified: new Date().toISOString() },
      ...posts.docs.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updatedAt,
      })),
      ...kbArticles.docs.map((k) => ({
        url: `${SITE_URL}/help/${k.slug}`,
        lastModified: k.updatedAt,
      })),
    ]
  },
  ['sitemap'],
  { tags: [CACHE_TAGS.POSTS_SITEMAP, CACHE_TAGS.KB_SITEMAP] },
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapData()
}
