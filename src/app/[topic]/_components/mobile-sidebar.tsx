'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
          <div className="relative flex h-4 w-4 items-center justify-center">
            <motion.span
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="bg-foreground absolute block h-px w-4 origin-center rounded-full"
            />
            <motion.span
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
              transition={{ duration: 0.3 }}
              className="bg-foreground absolute block h-px w-4 origin-center rounded-full"
            />
          </div>

          <span className="tracking-[3px]">MENU</span>
        </button>

        {open && (
          <>
            <div className="px-4 pt-4 pb-2">{switcher}</div>
            <div
              className="__scrollbar-custom overflow-y-auto px-4 pb-6"
              style={{ height: 'calc(100dvh - 65px - 48px - 60px)' }}
            >
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
