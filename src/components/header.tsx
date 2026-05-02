'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import AppLogo from './app-logo'

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/', label: 'Docs', matchRoot: true },
  { href: 'https://evocave.com/blog', label: 'Blog', external: true },
  { href: 'https://evocave.com/templates', label: 'Templates', external: true },
  { href: 'https://help.evocave.com', label: 'Support', external: true },
]

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const getIsActive = (link: (typeof NAV_LINKS)[number]) => {
    if (link.matchRoot) {
      return !NAV_LINKS.filter(l => !l.matchRoot).some(l => pathname.startsWith(l.href))
    }
    return pathname === link.href || pathname.startsWith(link.href + '/')
  }

  return (
    <>
      <header className="dark:bg-background bg-background sticky top-0 z-50 flex w-full items-center border-b px-6 py-3">
        <nav className="mx-auto flex w-full max-w-350 flex-row items-center justify-between">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <AppLogo href="/" height={20} sublogo="docs" />

            {/* Desktop Nav Links */}
            <div className="hidden items-center gap-5 lg:flex">
              {NAV_LINKS.map(link => {
                const isActive = getIsActive(link)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'text-sm transition-colors duration-150',
                      isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right: Search + Language + Theme */}
          <div className="flex items-center gap-2">
            {/* Search — desktop */}
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-docs-search'))}
              className="text-muted-foreground border-border hover:bg-secondary/50 hidden min-w-52 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors lg:flex"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="flex-1 text-left text-xs">Search docs...</span>
              <kbd className="border-border rounded border px-1.5 py-0.5 text-xs">{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
            </button>

            {/* Search icon — mobile */}
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-docs-search'))}
              className="text-muted-foreground hover:text-foreground border-border flex size-8 items-center justify-center rounded-md border transition-colors lg:hidden"
              aria-label="Search"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Hamburger — mobile */}
            <button
              className="text-foreground border-border flex size-8 items-center justify-center rounded-md border transition-colors lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <path d="M6 6L26 26M26 6L6 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <path d="M4 11H28M4 21H28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="bg-background border-border fixed inset-0 top-14.25 z-40 border-t lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex flex-col gap-1 px-6 py-4" onClick={e => e.stopPropagation()}>
            {NAV_LINKS.map(link => {
              const isActive = getIsActive(link)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'border-border border-b py-3 text-sm transition-colors last:border-0',
                    isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
