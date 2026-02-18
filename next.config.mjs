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
