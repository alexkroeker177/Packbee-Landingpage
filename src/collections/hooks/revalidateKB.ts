import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { KnowledgeBase } from '../../../payload-types'
import { CACHE_TAGS } from '../../lib/cache-tags'

export const revalidateKB: CollectionAfterChangeHook<KnowledgeBase> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating KB article: /help/${doc.slug}`)
      revalidatePath(`/help/${doc.slug}`, 'page')
      revalidatePath('/help', 'page')
      revalidateTag(CACHE_TAGS.KB_SITEMAP, 'everything')
    }
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating unpublished KB article: /help/${previousDoc.slug}`)
      revalidatePath(`/help/${previousDoc.slug}`, 'page')
      revalidatePath('/help', 'page')
      revalidateTag(CACHE_TAGS.KB_SITEMAP, 'everything')
    }
  }
  return doc
}
