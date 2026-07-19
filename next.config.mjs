import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No server route remains (BYOK AI calls happen client-side, directly
  // from the browser to the provider's API — see lib/ai/). The app is
  // fully static: every page is prerendered per locale via
  // generateStaticParams in app/[locale]/layout.tsx.
  output: 'export',
}

export default withNextIntl(nextConfig)
