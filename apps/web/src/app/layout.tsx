import type { Metadata, Viewport } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: {
    default: 'Soundwave Fest 2026 | Feel The Rhythm',
    template: '%s | Soundwave Fest 2026'
  },
  description: 'Platform resmi pembelian tiket Soundwave Fest 2026. Dapatkan e-ticket QR Code, lineup artis, jadwal, dan informasi lengkap festival musik terbaik tahun 2026.',
  keywords: ['Soundwave Fest', 'festival musik', 'tiket festival', 'e-ticket', 'Jakarta', '2026'],
  authors: [{ name: 'Soundwave Fest Team' }],
  creator: 'Soundwave Fest',
  publisher: 'Soundwave Fest',
  formatDetection: {
    telephone: false,
    address: false,
    email: false
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'Soundwave Fest 2026',
    title: 'Soundwave Fest 2026 | Feel The Rhythm',
    description: 'Platform resmi pembelian tiket Soundwave Fest 2026. Dapatkan e-ticket QR Code, lineup artis, jadwal, dan informasi lengkap.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Soundwave Fest 2026'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soundwave Fest 2026',
    description: 'Platform resmi pembelian tiket Soundwave Fest 2026',
    images: ['/og-image.png'],
    creator: '@soundwavefest'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'manifest',
        url: '/manifest.json'
      }
    ]
  },
  manifest: '/manifest.json',
  themeColor: '#FF6B00',
  category: 'entertainment'
}

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body
        className={`${inter.variable} ${oswald.variable} font-body antialiased dark:bg-dark-950 dark:text-white`}
      >
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700',
              style: { boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
              duration: 4000
            }}
          />
        </Providers>
      </body>
    </html>
  )
}