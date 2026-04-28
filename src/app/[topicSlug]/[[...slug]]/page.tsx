import { notFound } from 'next/navigation'
import {
    getDocPage,
    getDocTree,
    getTopics,
    buildSidebarNavData
} from '../_actions/docs.actions'
import { addHeadingIds, sanitizeContent } from '@/lib/docs-content'
import Breadcrumb from '../_components/breadcrumb'
import Toc from '../_components/toc'
import TocAction from '../_components/toc-action'
import Pagination from '../_components/pagination'
import Feedback from '../_components/feedback'
import ArticleTranslator from '../_components/article-translator'
import ViewCount from '../_components/view-count'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{
        topicSlug: string
        slug?: string[]
    }>
}

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.evocave.com'
const DEFAULT_DESCRIPTION = 'Official documentation for Evocave — explore guides, references, and more.'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getReadingTime(html: string): string {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const words = text.split(' ').filter(Boolean).length
    return `${Math.ceil(words / 200)} min read`
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { topicSlug, slug = [] } = await params
    const slugPath = slug.join('/')
    if (!slugPath) return { title: 'Evocave Docs' }

    const result = await getDocPage(topicSlug, slugPath)
    if (result.error || !result.data) return { title: 'Evocave Docs' }

    const page = result.data
    return {
        title: `${page.title} — Evocave Docs`,
        description: page.description ?? DEFAULT_DESCRIPTION,
        openGraph: {
            title: `${page.title} — Evocave Docs`,
            description: page.description ?? DEFAULT_DESCRIPTION,
            url: `${BASE_URL}/${topicSlug}/${slugPath}`,
            siteName: 'Evocave Docs',
            type: page.type === 'article' ? 'article' : 'website'
        }
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DocsSlugPage({ params }: Props) {
    const { topicSlug, slug = [] } = await params
    const slugPath = slug.join('/')

    const [topicsResult, treeResult, pageResult] = await Promise.all([
        getTopics(),
        getDocTree(topicSlug),
        getDocPage(topicSlug, slugPath)
    ])

    if (topicsResult.error || !topicsResult.data) notFound()
    if (treeResult.error || !treeResult.data) notFound()
    if (pageResult.error || !pageResult.data) notFound()

    const page = pageResult.data
    const navData = buildSidebarNavData(treeResult.data, topicSlug)

    // ─── Build breadcrumb dari slug parts ─────────────────────────────────────
    const breadcrumbItems: { label: string; href?: string }[] = []
    const topic = topicsResult.data.find((t) => t.slug === topicSlug)
    if (topic) {
        breadcrumbItems.push({ label: topic.title, href: `/${topicSlug}` })
    }

    let accHref = `/${topicSlug}`
    for (let i = 0; i < slug.length; i++) {
        accHref += `/${slug[i]}`
        const isLast = i === slug.length - 1
        if (isLast) {
            breadcrumbItems.push({ label: page.title })
        } else {
            // Cari label dari navData
            const section = navData.sections.find((s) => s.slug === slug[i])
            const industry = section?.industries.find((ind) => ind.slug === slug[i])
            const label = section?.title ?? industry?.title ?? slug[i]
            breadcrumbItems.push({ label, href: accHref })
        }
    }

    // ─── Article page ─────────────────────────────────────────────────────────
    if (page.type === 'article') {
        const processedContent = addHeadingIds(
            sanitizeContent(page.content ?? '')
        )
        const readingTime = getReadingTime(processedContent)

        return (
            <div className="flex gap-6 lg:gap-12">
                <article className="flex-1 min-w-0 pr-0 lg:pr-16">
                    <Breadcrumb items={breadcrumbItems} />
                    <h1 className="text-3xl lg:text-5xl font-bold mt-2 mb-3">
                        {page.title}
                    </h1>
                    <p className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5">
                        <span>{readingTime}</span>
                        <span>·</span>
                        <span>Updated on {formatDate(page.updatedAt)}</span>
                        <ViewCount nodeId={page.id} />
                    </p>
                    {page.description && (
                        <p className="text-base text-foreground mb-5">
                            {page.description}
                        </p>
                    )}
                    <hr className="border-border mt-5 pb-5" />
                    <ArticleTranslator
                        nodeId={page.id}
                        content={processedContent}
                        className="prose prose-neutral dark:prose-invert max-w-none"
                    />
                    <Pagination navData={navData} />
                    <Feedback />
                </article>
                <Toc content={processedContent} docTitle={page.title} />
            </div>
        )
    }

    // ─── Section / Industry page (overview dengan card grid) ──────────────────
    const cards = (() => {
        if (slug.length === 1) {
            const section = navData.sections.find((s) => s.slug === slug[0])
            if (!section) return []
            if (section.industries.length > 0) {
                return section.industries.map((ind) => ({
                    id: ind.id,
                    label: ind.title,
                    href: `/${topicSlug}/${slug[0]}/${ind.slug}`,
                    description: undefined as string | undefined
                }))
            }
            return section.directArticles.map((art) => ({
                id: art.id,
                label: art.title,
                href: art.href,
                description: undefined as string | undefined
            }))
        }

        if (slug.length === 2) {
            const section = navData.sections.find((s) => s.slug === slug[0])
            const industry = section?.industries.find((i) => i.slug === slug[1])
            if (!industry) return []
            return industry.articles.map((art) => ({
                id: art.id,
                label: art.title,
                href: art.href,
                description: undefined as string | undefined
            }))
        }

        return []
    })()

    const processedContent = page.content
        ? addHeadingIds(sanitizeContent(page.content))
        : ''

    return (
        <div className="flex gap-6 lg:gap-12">
            <div className="flex-1 min-w-0 pr-0 lg:pr-16">
                <Breadcrumb items={breadcrumbItems} />
                <h1 className="text-3xl lg:text-4xl font-bold mt-2 mb-3">
                    {page.title}
                </h1>
                {page.description && (
                    <p className="text-sm text-muted-foreground mb-5">
                        {page.description}
                    </p>
                )}
                {processedContent && (
                    <>
                        <hr className="border-border mt-5 pb-5" />
                        <div
                            className="prose prose-neutral dark:prose-invert max-w-none mb-10"
                            dangerouslySetInnerHTML={{ __html: processedContent }}
                        />
                    </>
                )}
                <hr className="border-border mt-5 mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cards.map((card) => (
                        <Link
                            key={card.id}
                            href={card.href}
                            className="group flex flex-col gap-1.5 p-5 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                        >
                            <p className="text-md font-semibold text-foreground">
                                {card.label}
                            </p>
                            {card.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {card.description}
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
                <Pagination navData={navData} />
                <Feedback />
            </div>
            <aside className="hidden xl:block w-56 shrink-0">
                <div className="sticky top-28 flex flex-col gap-6">
                    <TocAction docTitle={page.title} />
                </div>
            </aside>
        </div>
    )
}