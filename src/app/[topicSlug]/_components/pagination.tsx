'use client'

import { SidebarNavData } from '@/types/docs'
import { cn } from '@/lib/utils'
import { MoveLeft, MoveRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type DocLink = {
    label: string
    href: string
}

function getAllPages(navData: SidebarNavData): DocLink[] {
    const pages: DocLink[] = []

    pages.push({
        label: navData.topicTitle,
        href: `/${navData.topicSlug}`
    })

    for (const section of navData.sections) {
        pages.push({
            label: section.title,
            href: `/${navData.topicSlug}/${section.slug}`
        })

        for (const article of section.directArticles) {
            if (article.href !== `/${navData.topicSlug}/${section.slug}`) {
                pages.push({ label: article.title, href: article.href })
            }
        }

        for (const industry of section.industries) {
            pages.push({
                label: industry.title,
                href: `/${navData.topicSlug}/${section.slug}/${industry.slug}`
            })
            for (const article of industry.articles) {
                pages.push({ label: article.title, href: article.href })
            }
        }
    }

    return pages
}

type Props = {
    navData: SidebarNavData
}

export default function Pagination({ navData }: Props) {
    const pathname = usePathname()
    const pages = getAllPages(navData)

    const currentIndex = pages.findIndex((p) => p.href === pathname)
    const prev = currentIndex > 0 ? pages[currentIndex - 1] : null
    const next = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null

    if (!prev && !next) return null

    return (
        <div className="docs-pagination flex lg:flex-row flex-col items-center gap-4 mt-12 border-t border-border pt-8">
            {prev ? (
                <Link
                    href={prev.href}
                    className={cn(
                        'w-full lg:flex-1 flex items-center gap-4 px-5 py-4 rounded-lg border border-border',
                        'hover:bg-secondary/30 transition-colors group justify-between'
                    )}
                >
                    <MoveLeft className="size-4 text-muted-foreground shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-0.5 text-right">Previous</p>
                        <p className="text-md font-medium text-foreground truncate text-right">{prev.label}</p>
                    </div>
                </Link>
            ) : (
                <div className="hidden lg:flex lg:flex-1" />
            )}

            {next ? (
                <Link
                    href={next.href}
                    className={cn(
                        'w-full lg:flex-1 flex items-center gap-4 px-5 py-4 rounded-lg border border-border justify-between',
                        'hover:bg-secondary/30 transition-colors group'
                    )}
                >
                    <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-0.5">Next</p>
                        <p className="text-md font-medium text-foreground truncate">{next.label}</p>
                    </div>
                    <MoveRight className="size-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
            ) : (
                <div className="hidden lg:flex lg:flex-1" />
            )}
        </div>
    )
}