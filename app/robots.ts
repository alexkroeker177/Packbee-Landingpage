import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
