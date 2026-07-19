import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'en', 'es', 'it', 'pt', 'de', 'zh', 'ar', 'hi'],
  defaultLocale: 'en',
  // Static export (next.config.mjs output: 'export') cannot run a proxy/
  // middleware, so there is no server available to negotiate a locale
  // from the Accept-Language header or a cookie. A prefix is required on
  // every URL, and the root page does a fixed build-time redirect to
  // defaultLocale instead — see app/page.tsx and
  // https://next-intl.dev/docs/routing/middleware (static export section).
  localePrefix: 'always',
  localeDetection: false,
})
