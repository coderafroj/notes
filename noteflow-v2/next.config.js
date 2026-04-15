/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  async rewrites() {
    return [
      { source: '/@:username', destination: '/:username' },
      { source: '/@:username/:slug', destination: '/:username/:slug' },
    ]
  },
}
module.exports = nextConfig
