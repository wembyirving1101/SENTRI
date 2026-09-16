import { fileURLToPath } from 'node:url'
const projectRoot = fileURLToPath(new URL('.', import.meta.url))
/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  outputFileTracingIncludes: { '/api/chat': ['./py/sentri.py'] },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
