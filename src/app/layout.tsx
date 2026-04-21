import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import AdminNavSidebar from '@/components/shared/AdminNavSidebar'
import { ToastProvider } from '@/components/shared/ToastProvider'
import PageTransition from '@/components/shared/PageTransition'
import ThemeToggle from '@/components/shared/ThemeToggle'
import DemoBadge from '@/components/shared/DemoBadge'
import RoughTopbar from '@/components/shared/RoughTopbar'
import { getAdminSessionServer, isAdminSession } from '@/lib/auth-server'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

// Inline script: applied before first paint to prevent flash of incorrect theme.
const themeScript = `
try {
  var t = localStorage.getItem('theme');
  var root = document.documentElement;
  if (t === 'light') {
    root.classList.add('light');
  } else if (t === 'dark') {
    root.classList.add('force-dark');
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.classList.add('light');
  }
} catch(e) {}
`.trim()

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return {
    metadataBase: new URL(baseUrl),
    title: t('title'),
    description: t('description'),
    alternates: { canonical: baseUrl },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: baseUrl,
      images: ['/og-image.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const session = await getAdminSessionServer()
  const isAdmin = isAdminSession(session)

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />
      </head>
      <body className="min-h-full bg-bg-base text-text-primary font-ui">
        {/* Global SVG filter — used via .sketchy class anywhere in the app */}
        <svg aria-hidden="true" className="absolute w-0 h-0 overflow-hidden" focusable="false">
          <defs>
            <filter id="sketchy-global" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
          <div className="flex min-h-screen">
            <AdminNavSidebar />
            <div className="flex-1 flex flex-col min-w-0 pb-14 md:pb-0">
              {/* Topbar */}
              <RoughTopbar>
                {!isAdmin && <DemoBadge />}
                <ThemeToggle />
              </RoughTopbar>
              {/* Page content */}
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </div>
          </ToastProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
