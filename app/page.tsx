import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

// Static export has no proxy/middleware to negotiate a locale, so the
// root path does a fixed build-time redirect to the default locale.
// Next.js implements redirect() in a static export as a prerendered
// HTML page with a client-side/meta redirect — no server function
// required. See i18n/routing.ts for the full explanation.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`)
}
