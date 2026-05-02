'use client'

import { SidebarNavData } from '@/types/docs'
import { cn } from '@/lib/utils'
import { ChevronRight, FolderClosed, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Props = {
  navData: SidebarNavData
}

function useActiveParts() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)
  return {
    topicSlug: parts[0] ?? null,
    sectionSlug: parts[1] ?? null,
    industrySlug: parts[2] ?? null,
    pathname,
  }
}

// ── Article list dengan tree connector ──────────────────────────────────────
type ArticleItem = { id: string; href: string; title: string }

function ArticleList({ articles, pathname }: { articles: ArticleItem[]; pathname: string }) {
  return (
    <div className="relative mb-1 ml-3.5">
      {/* Vertical line artikel — berhenti di tengah item terakhir */}
      <div className="absolute top-0 left-0 w-px bg-zinc-700" style={{ height: 'calc(100% - 30px)' }} />
      {articles.map(article => {
        const isActive = pathname === article.href
        return (
          <div key={article.id} className="relative pl-2">
            {/* Stub horizontal per artikel */}
            <div className="absolute top-4 left-0 -mt-4 h-4 w-2 rounded-bl-2xl border-b border-l border-zinc-700" />
            <Link
              href={article.href}
              className={cn(
                'block rounded-md px-1.5 py-1.5 text-sm transition-colors',
                isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {article.title}
            </Link>
          </div>
        )
      })}
    </div>
  )
}

// ── Industry list dengan tree connector ─────────────────────────────────────
type IndustryItem = {
  id: string
  slug: string
  title: string
  articles: ArticleItem[]
}

function IndustryList({
  industries,
  topicSlug,
  sectionSlug,
  pathname,
  openIndustry,
  setOpenIndustry,
}: {
  industries: IndustryItem[]
  topicSlug: string
  sectionSlug: string
  pathname: string
  openIndustry: string | null
  setOpenIndustry: (slug: string) => void
}) {
  return (
    <div className="ml-3.5">
      {industries.map((industry, index) => {
        const isLast = index === industries.length - 1
        const industryHref = `/${topicSlug}/${sectionSlug}/${industry.slug}`
        const isIndustryOpen = openIndustry === industry.slug
        const isIndustryActive = pathname.startsWith(industryHref)
        const isDocActive = industry.articles.some(a => pathname === a.href)

        return (
          <div key={industry.id} className="relative pl-2">
            {/* Vertical line per item — last hanya 16px, sisanya full */}
            <div
              className="absolute top-0 left-0 w-px bg-zinc-700"
              style={{ height: isLast ? '0px' : 'calc(100% + 8px)' }}
            />
            {/* Stub horizontal dengan rounded corner */}
            <div className="absolute top-4 left-0 -mt-4 h-4 w-2 rounded-bl-2xl border-b border-l border-zinc-700" />

            {/* Industry row */}
            <div className="flex items-center">
              <Link
                href={industryHref}
                onClick={() => setOpenIndustry(industry.slug)}
                className={cn(
                  'flex flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isDocActive || isIndustryActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {isIndustryOpen ? (
                  <FolderOpen className="size-3.5 shrink-0" />
                ) : (
                  <FolderClosed className="size-3.5 shrink-0" />
                )}
                <span className="truncate">{industry.title}</span>
              </Link>
              {industry.articles.length > 0 && (
                <button
                  onClick={() => setOpenIndustry(openIndustry === industry.slug ? '' : industry.slug)}
                  className="shrink-0 p-1"
                >
                  <ChevronRight
                    className={cn(
                      'size-3.5 transition-transform duration-200',
                      isIndustryOpen ? 'rotate-90' : 'rotate-0',
                      isDocActive || isIndustryActive ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  />
                </button>
              )}
            </div>

            {/* Articles */}
            {isIndustryOpen && industry.articles.length > 0 && (
              <ArticleList articles={industry.articles} pathname={pathname} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SidebarNav({ navData }: Props) {
  const { sectionSlug, industrySlug, pathname } = useActiveParts()

  const [openSection, setOpenSection] = useState<string | null>(sectionSlug ?? null)
  const [openIndustry, setOpenIndustry] = useState<string | null>(industrySlug ?? null)

  useEffect(() => {
    setOpenSection(sectionSlug ?? null)
    setOpenIndustry(industrySlug ?? null)
  }, [navData.topicSlug, sectionSlug, industrySlug])

  const indicatorRef = useRef<HTMLDivElement>(null)
  const prevTopRef = useRef<number | null>(null)

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
  }, [pathname])

  return (
    <nav>
      <ul className="space-y-1 pb-6">
        {navData.sections.map(section => {
          const sectionHref = `/${navData.topicSlug}/${section.slug}`
          const isSectionOpen = openSection === section.slug
          const isSectionActive = pathname.startsWith(sectionHref)
          const hasIndustries = section.industries.length > 0
          const hasDirectArticles = section.directArticles.length > 0
          const hasChildren = hasIndustries || hasDirectArticles

          return (
            <li key={section.id}>
              {/* Section row */}
              <div className="flex w-full items-center">
                <Link
                  href={sectionHref}
                  onClick={() => {
                    if (hasChildren) {
                      setOpenSection(section.slug)
                      if (section.slug !== openSection) setOpenIndustry(null)
                    }
                  }}
                  className={cn(
                    'flex-1 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    isSectionActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {section.title}
                </Link>
                {hasChildren && (
                  <button
                    onClick={() => {
                      setOpenSection(prev => (prev === section.slug ? null : section.slug))
                      setOpenIndustry(null)
                    }}
                    className="shrink-0 p-1"
                  >
                    <ChevronRight
                      className={cn(
                        'text-muted-foreground size-3.5 transition-transform duration-200',
                        isSectionOpen ? 'rotate-90' : 'rotate-0',
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Section children */}
              {isSectionOpen && hasChildren && (
                <div className="mt-1 mb-1">
                  {hasIndustries && (
                    <IndustryList
                      industries={section.industries}
                      topicSlug={navData.topicSlug}
                      sectionSlug={section.slug}
                      pathname={pathname}
                      openIndustry={openIndustry}
                      setOpenIndustry={setOpenIndustry}
                    />
                  )}

                  {/* Direct articles */}
                  {hasDirectArticles && !hasIndustries && (
                    <ArticleList articles={section.directArticles} pathname={pathname} />
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
