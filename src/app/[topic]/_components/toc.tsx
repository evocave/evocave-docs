'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import TocAction from './toc-action'

type Heading = {
  id: string
  label: string
  level: number
}

type Props = {
  content: string
  docTitle?: string
}

function parseHeadings(html: string): Heading[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h2, h3')

  return Array.from(headings).map(el => ({
    id: el.id || '',
    label: el.textContent || '',
    level: parseInt(el.tagName[1]),
  }))
}

export default function Toc({ content, docTitle }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const isClickingRef = useRef(false)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const prevTopRef = useRef<number | null>(null)

  useEffect(() => {
    setHeadings(parseHeadings(content))
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const NAVBAR_HEIGHT = 112 // sesuai scroll-margin-top di addHeadingIds

    const observer = new IntersectionObserver(
      () => {
        if (isClickingRef.current) return

        // Cari heading yang paling dekat dengan batas atas viewport (setelah navbar)
        let closestId = ''
        let closestDistance = Infinity

        headings.forEach(({ id }) => {
          const el = document.getElementById(id)
          if (!el) return
          const top = el.getBoundingClientRect().top - NAVBAR_HEIGHT
          // Heading yang sudah lewat atau tepat di batas atas (top <= 0 paling dekat ke 0)
          if (top <= 8) {
            const distance = Math.abs(top)
            if (distance < closestDistance) {
              closestDistance = distance
              closestId = id
            }
          }
        })

        if (closestId) setActiveId(closestId)
      },
      {
        rootMargin: `-${NAVBAR_HEIGHT}px 0px -60% 0px`,
        threshold: 0,
      },
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  useEffect(() => {
    const el = indicatorRef.current
    if (!el) return

    const currentTop = el.getBoundingClientRect().top

    if (prevTopRef.current !== null) {
      const delta = prevTopRef.current - currentTop
      if (delta !== 0) {
        el.style.transform = `translateY(${delta}px)`
        el.style.transition = 'none'
        requestAnimationFrame(() => {
          el.style.transform = 'translateY(0)'
          el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
        })
      }
    }

    prevTopRef.current = currentTop
  }, [activeId])

  const handleClick = (id: string) => {
    setActiveId(id)
    isClickingRef.current = true
    setTimeout(() => {
      isClickingRef.current = false
    }, 1000)
  }

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-28 flex flex-col gap-6">
        <TocAction docTitle={docTitle} />
        {headings.length > 0 && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">On This Page</p>
            <ul className="border-border space-y-2 border-l">
              {headings.map(heading => (
                <li key={heading.id} className="relative">
                  {activeId === heading.id && (
                    <div
                      ref={indicatorRef}
                      className="bg-foreground absolute inset-y-0.5 left-0 -ml-px w-0.5 rounded-full"
                    />
                  )}
                  <Link
                    href={`#${heading.id}`}
                    title={heading.label}
                    onClick={() => handleClick(heading.id)}
                    className={cn(
                      '-ml-px block truncate py-1 text-sm transition-colors',
                      heading.level === 3 ? 'pl-4' : 'pl-3',
                      activeId === heading.id
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {heading.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  )
}
