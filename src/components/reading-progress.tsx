'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      setProgress(scrolled)
      setShowBackToTop(scrollTop > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 right-0 left-0 z-200 h-px bg-transparent">
        <div
          className="bg-foreground/50 h-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={cn(
          'border-border bg-background text-muted-foreground fixed right-4 bottom-4 z-50 rounded-full border p-2.5 shadow-sm lg:right-10 lg:bottom-10 print:hidden',
          'hover:text-foreground hover:bg-secondary/50 transition-all duration-200',
          showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <ArrowUp className="size-4" />
      </button>
    </>
  )
}
