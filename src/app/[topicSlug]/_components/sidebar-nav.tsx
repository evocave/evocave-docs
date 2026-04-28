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
        pathname
    }
}

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
        <nav className="relative flex-1 overflow-y-auto hide-scrollbar">
            <ul className="space-y-1 pb-6">
                {navData.sections.map((section) => {
                    const sectionHref = `/${navData.topicSlug}/${section.slug}`
                    const isSectionOpen = openSection === section.slug
                    const isSectionActive = pathname.startsWith(sectionHref)
                    const hasIndustries = section.industries.length > 0
                    const hasDirectArticles = section.directArticles.length > 0

                    // Section tanpa konten apapun
                    if (!hasIndustries && !hasDirectArticles) {
                        return (
                            <li key={section.id}>
                                <span className="flex w-full items-center px-4 lg:px-2 py-1 text-sm font-medium text-muted-foreground/50 cursor-default">
                                    {section.title}
                                </span>
                            </li>
                        )
                    }

                    // Section dengan directArticles (tanpa industry) — tidak tampil di sidebar per PRD
                    // Hanya tampilkan section label sebagai link ke halaman section
                    if (hasDirectArticles && !hasIndustries) {
                        return (
                            <li key={section.id}>
                                <Link
                                    href={sectionHref}
                                    className={cn(
                                        'flex w-full items-center px-4 lg:px-2 py-1 text-sm font-medium transition-colors',
                                        isSectionActive
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {section.title}
                                </Link>
                            </li>
                        )
                    }

                    // Section dengan industries
                    return (
                        <li key={section.id}>
                            <div className="flex w-full items-center justify-between">
                                <Link
                                    href={sectionHref}
                                    onClick={() => {
                                        setOpenSection(section.slug)
                                        if (section.slug !== openSection) setOpenIndustry(null)
                                    }}
                                    className={cn(
                                        'flex-1 px-4 lg:px-2 py-1 text-sm font-medium transition-colors',
                                        isSectionActive
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {section.title}
                                </Link>
                                <button
                                    onClick={() => {
                                        setOpenSection((prev) => prev === section.slug ? null : section.slug)
                                        setOpenIndustry(null)
                                    }}
                                    className="px-2 py-1"
                                >
                                    <ChevronRight className={cn(
                                        'size-4 transition-transform duration-200 text-muted-foreground',
                                        isSectionOpen ? 'rotate-90' : 'rotate-0'
                                    )} />
                                </button>
                            </div>

                            {isSectionOpen && (
                                <ul className="mt-1 space-y-0.5 px-4 lg:px-2">
                                    {section.industries.map((industry) => {
                                        const industryHref = `/${navData.topicSlug}/${section.slug}/${industry.slug}`
                                        const isIndustryOpen = openIndustry === industry.slug
                                        const isIndustryActive = pathname.startsWith(industryHref)
                                        const isDocActive = industry.articles.some((a) => pathname === a.href)

                                        return (
                                            <li key={industry.id}>
                                                <div className="flex w-full items-center gap-2">
                                                    <Link
                                                        href={industryHref}
                                                        onClick={() => setOpenIndustry(industry.slug)}
                                                        className={cn(
                                                            'flex flex-1 items-center gap-2 py-1.5 text-sm transition-colors rounded-sm',
                                                            isDocActive || isIndustryActive
                                                                ? 'text-foreground font-semibold'
                                                                : 'text-muted-foreground hover:text-foreground font-medium'
                                                        )}
                                                    >
                                                        {isIndustryOpen
                                                            ? <FolderOpen className={cn('size-4 shrink-0', isDocActive || isIndustryActive ? 'text-foreground' : 'text-muted-foreground')} />
                                                            : <FolderClosed className={cn('size-4 shrink-0', isDocActive || isIndustryActive ? 'text-foreground' : 'text-muted-foreground')} />
                                                        }
                                                        <span className="truncate">{industry.title}</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => setOpenIndustry((prev) => prev === industry.slug ? null : industry.slug)}
                                                        className="shrink-0"
                                                    >
                                                        <ChevronRight className={cn(
                                                            'size-4 transition-transform duration-200',
                                                            isIndustryOpen ? 'rotate-90' : 'rotate-0',
                                                            isDocActive || isIndustryActive ? 'text-foreground' : 'text-muted-foreground'
                                                        )} />
                                                    </button>
                                                </div>

                                                {isIndustryOpen && industry.articles.length > 0 && (
                                                    <ul className="ml-4 space-y-0.5 mt-0.5 relative">
                                                        <div className="absolute left-px top-1.5 bottom-1.5 w-px bg-border" />
                                                        {industry.articles.map((article) => {
                                                            const isActive = pathname === article.href
                                                            return (
                                                                <li key={article.id} className="relative">
                                                                    {isActive && (
                                                                        <div
                                                                            ref={indicatorRef}
                                                                            className="absolute left-px inset-y-1.5 w-0.5 bg-foreground -ml-px rounded-full"
                                                                        />
                                                                    )}
                                                                    <Link
                                                                        href={article.href}
                                                                        className={cn(
                                                                            'block pl-3 py-1.5 text-sm transition-colors',
                                                                            isActive
                                                                                ? 'text-foreground font-semibold'
                                                                                : 'text-muted-foreground hover:text-foreground'
                                                                        )}
                                                                    >
                                                                        {article.title}
                                                                    </Link>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}