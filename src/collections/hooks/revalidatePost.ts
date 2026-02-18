import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { Post } from '../../../payload-types'
import { CACHE_TAGS } from '../../lib/cache-tags'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating post: /blog/${doc.slug}`)
      revalidatePath(`/blog/${doc.slug}`, 'page')
      revalidateTag(CACHE_TAGS.POSTS_SITEMAP, 'everything')
    }
    // Handle unpublishing
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating unpublished post: /blog/${previousDoc.slug}`)
      revalidatePath(`/blog/${previousDoc.slug}`, 'page')
      revalidateTag(CACHE_TAGS.POSTS_SITEMAP, 'everything')
    }
  }
  return doc
}
