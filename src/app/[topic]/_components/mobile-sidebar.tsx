'use client'

import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
  switcher: React.ReactNode
  nav: React.ReactNode
}

export default function MobileSidebar({ switcher, nav }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div className="bg-background fixed top-16.5 right-0 left-0 z-30 flex flex-col lg:hidden print:hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className={cn('text-foreground border-border flex w-full items-center gap-2 border-b px-4 py-3.5 text-sm')}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <path d="M6 6L26 26M26 6L6 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <path d="M4 11H28M4 21H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          <span className="tracking-[3px]">MENU</span>
        </button>

        {open && (
          <>
            <div className="px-4 pt-4 pb-2">{switcher}</div>
            <div className="overflow-y-auto px-4 pb-6" style={{ height: 'calc(100dvh - 65px - 48px - 60px)' }}>
              {nav}
            </div>
          </>
        )}
      </div>

      {open && <div className="bg-background fixed inset-0 top-16.5 z-20" />}

      <div className="h-12 lg:hidden" />
    </>
  )
}
