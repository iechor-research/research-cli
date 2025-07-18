/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // 使用 pages 目录
  },
  // 支持 TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  // 支持 ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  // 静态资源优化
  images: {
    domains: ['assets.vercel.com'],
  },
  // 环境变量
  env: {
    CUSTOM_KEY: 'research-cli-web',
  },
  // 重定向规则
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 