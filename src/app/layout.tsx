import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/context/languageContext'
import ReadingProgress from '@/components/reading-progress'
import Header from '@/components/header'
import Footer from '@/components/footer'
import GoogleAnalytics from '@/components/google-analytics'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Evocave Docs',
    template: '%s | Evocave Docs',
  },
  description: 'Official documentation for Evocave — explore guides, references, and more.',
  verification: {
    google: '-2GKX8-wcGLvy8dHZdo64n33pnpURJjYpkgWOWepZiY',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <GoogleAnalytics />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <ReadingProgress />
            <Header />
            {children}
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
