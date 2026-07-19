import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { inter, jetbrainsMono } from '@/app/fonts'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata = {
  title: 'PBI Theme Generator AI',
  description: 'Generate Power BI theme JSON files from a text description or brand image using AI agents.',
}

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Required for static export: tells next-intl which locale is being
  // rendered so it reads from this value instead of headers()/cookies(),
  // which are unavailable at build time and would otherwise force
  // dynamic rendering (which is incompatible with `output: 'export'`).
  // Must run before any other next-intl server call in this tree.
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
