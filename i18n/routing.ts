import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'en', 'es', 'it', 'pt', 'de', 'zh', 'ar', 'hi'],
  defaultLocale: 'en',
  localeDetection: true,
})
