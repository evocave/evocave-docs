// src/app/[topic]/[[...slug]]/page.tsx

import { notFound } from 'next/navigation'
import { getDocPage, getDocTree, getTopics, buildSidebarNavData } from '../_actions/docs.actions'
import { addHeadingIds, sanitizeContent } from '@/lib/docs-content'
import Breadcrumb from '../_components/breadcrumb'
import Toc from '../_components/toc'
import TocAction from '../_components/toc-action'
import Pagination from '../_components/pagination'
import Feedback from '../_components/feedback'
import Link from 'next/link'
import type { Metadata } from 'next'
import ArticleContent from '../_components/article-content'
import ViewCount from '../_components/view-count'

type Props = {
  params: Promise<{
    topic: string
    slug?: string[]
  }>
}

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.evocave.com'
const DEFAULT_DESCRIPTION = 'Official documentation for Evocave — explore guides, references, and more.'

function getReadingTime(html: string): string {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const words = text.split(' ').filter(Boolean).length
  return `${Math.ceil(words / 200)} min read`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic, slug = [] } = await params

  if (slug.length === 0) {
    const result = await getTopics()
    if (result.error || !result.data) return { title: 'Docs' }
    const t = result.data.find(t => t.slug === topic)
    if (!t) return { title: 'Docs' }

    const ogImageUrl = new URL('/api/og', BASE_URL)
    ogImageUrl.searchParams.set('title', t.title)
    ogImageUrl.searchParams.set('topic', 'Evocave Docs')

    return {
      title: t.title,
      description: t.description ?? undefined,
      openGraph: {
        title: `${t.title} | Evocave Docs`,
        description: t.description ?? undefined,
        url: `${BASE_URL}/${topic}`,
        siteName: 'Evocave Docs',
        type: 'website',
        images: [{ url: ogImageUrl.toString(), width: 1200, height: 630 }],
      },
    }
  }

  const slugPath = slug.join('/')
  const [pageResult, topicsResult] = await Promise.all([getDocPage(topic, slugPath), getTopics()])

  if (pageResult.error || !pageResult.data) return { title: 'Docs' }
  const page = pageResult.data
  const topicData = topicsResult.data?.find(t => t.slug === topic)

  const ogImageUrl = new URL('/api/og', BASE_URL)
  ogImageUrl.searchParams.set('title', page.title)
  ogImageUrl.searchParams.set('topic', topicData?.title ?? topic)
  if (slug.length > 1) {
    const breadcrumbSlugs = slug.slice(0, -1).map(s =>
      s
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    )
    ogImageUrl.searchParams.set('breadcrumb', breadcrumbSlugs.join(' / '))
  }

  return {
    title: page.title,
    description: page.description ?? DEFAULT_DESCRIPTION,
    openGraph: {
      title: `${page.title} | Evocave Docs`,
      description: page.description ?? DEFAULT_DESCRIPTION,
      url: `${BASE_URL}/${topic}/${slugPath}`,
      siteName: 'Evocave Docs',
      type: page.type === 'article' ? 'article' : 'website',
      images: [{ url: ogImageUrl.toString(), width: 1200, height: 630 }],
    },
  }
}

export default async function DocsSlugPage({ params }: Props) {
  const { topic, slug = [] } = await params

  const [topicsResult, treeResult] = await Promise.all([getTopics(), getDocTree(topic)])

  if (topicsResult.error || !topicsResult.data) notFound()
  if (treeResult.error || !treeResult.data) notFound()

  const navData = buildSidebarNavData(treeResult.data, topic)
  const topicData = topicsResult.data.find(t => t.slug === topic)
  if (!topicData) notFound()

  // ─── Topic root page (slug kosong) ────────────────────────────────────────
  if (slug.length === 0) {
    const topicContent = topicData.content ? addHeadingIds(sanitizeContent(topicData.content)) : ''

    return (
      <div className="flex gap-6 lg:gap-12">
        <div className="min-w-0 flex-1 pr-0 lg:pr-16">
          <div className="flex flex-col gap-4">
            <h1 className="mt-2 mb-3 text-3xl font-bold lg:text-4xl">{topicData.title}</h1>
            {topicData.description && <p className="text-foreground/90 mb-5 text-base">{topicData.description}</p>}
          </div>
          {topicContent && (
            <>
              <hr className="border-border mt-5 pb-5" />
              <div
                className="tiptap prose prose-neutral dark:prose-invert mb-10 max-w-none"
                dangerouslySetInnerHTML={{ __html: topicContent }}
              />
            </>
          )}
          <hr className="border-border mt-5 pb-8" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {navData.sections.map(section => (
              <Link
                key={section.id}
                href={`/${topic}/${section.slug}`}
                className="group border-border hover:bg-secondary/30 flex flex-col gap-1.5 rounded-lg border p-5 transition-colors"
              >
                <p className="text-md text-foreground font-semibold">{section.title}</p>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {section.description ??
                    (section.industries.length > 0
                      ? `${section.industries.length} ${section.industries.length === 1 ? 'category' : 'categories'}`
                      : section.directArticles.length > 0
                        ? `${section.directArticles.length} ${section.directArticles.length === 1 ? 'article' : 'articles'}`
                        : null)}
                </p>
              </Link>
            ))}
          </div>
          <Pagination navData={navData} />
          <Feedback />
        </div>
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-28 flex flex-col gap-6">
            <TocAction docTitle={topicData.title} />
          </div>
        </aside>
      </div>
    )
  }

  // ─── Slug page ─────────────────────────────────────────────────────────────
  const slugPath = slug.join('/')
  const pageResult = await getDocPage(topic, slugPath)
  if (pageResult.error || !pageResult.data) notFound()
  const page = pageResult.data

  // Breadcrumb
  const breadcrumbItems: { label: string; href?: string }[] = [{ label: topicData.title, href: `/${topic}` }]
  let accHref = `/${topic}`
  for (let i = 0; i < slug.length; i++) {
    accHref += `/${slug[i]}`
    const isLast = i === slug.length - 1
    if (isLast) {
      breadcrumbItems.push({ label: page.title })
    } else {
      const section = navData.sections.find(s => s.slug === slug[i])
      const industry = section?.industries.find(ind => ind.slug === slug[i])
      const label = section?.title ?? industry?.title ?? slug[i]
      breadcrumbItems.push({ label, href: accHref })
    }
  }

  // ─── Article ───────────────────────────────────────────────────────────────
  if (page.type === 'article') {
    const processedContent = addHeadingIds(sanitizeContent(page.content ?? ''))
    const readingTime = getReadingTime(processedContent)
    return (
      <div className="flex gap-6 lg:gap-12">
        <article className="min-w-0 flex-1 pr-0 lg:pr-16">
          <div className="flex flex-col gap-6">
            <Breadcrumb items={breadcrumbItems} />
            <ArticleContent
              page={page}
              processedContent={processedContent}
              topicSlug={topic}
              slugPath={slugPath}
              readingTime={readingTime}
              formattedDate={formatDate(page.updatedAt)}
            />
          </div>
          <Pagination navData={navData} />
          <Feedback />
        </article>
        <Toc content={processedContent} docTitle={page.title} />
      </div>
    )
  }

  // ─── Section / Industry overview ───────────────────────────────────────────
  const cards = (() => {
    if (slug.length === 1) {
      const section = navData.sections.find(s => s.slug === slug[0])
      if (!section) return []
      if (section.industries.length > 0) {
        return section.industries.map(ind => ({
          id: ind.id,
          label: ind.title,
          href: `/${topic}/${slug[0]}/${ind.slug}`,
          description: ind.description,
        }))
      }
      return section.directArticles.map(art => ({
        id: art.id,
        label: art.title,
        href: art.href,
        description: undefined as string | undefined,
      }))
    }
    if (slug.length === 2) {
      const section = navData.sections.find(s => s.slug === slug[0])
      const industry = section?.industries.find(i => i.slug === slug[1])
      if (!industry) return []
      return industry.articles.map(art => ({
        id: art.id,
        label: art.title,
        href: art.href,
        description: art.description,
      }))
    }
    return []
  })()

  const processedContent = page.content ? addHeadingIds(sanitizeContent(page.content)) : ''
  const readingTime = getReadingTime(processedContent)

  return (
    <div className="flex gap-6 lg:gap-12">
      <div className="min-w-0 flex-1 pr-0 lg:pr-16">
        <div className="flex flex-col gap-4">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="mt-2 mb-3 text-3xl font-bold lg:text-4xl">{page.title}</h1>
              <p className="text-muted-foreground mb-5 flex items-center gap-1.5 text-sm">
                <span>{readingTime}</span>
                <span>·</span>
                <ViewCount nodeId={page.id} initialViews={page.meta?.views ?? 0} />
                <span>·</span>
                <span>Updated on {formatDate(page.updatedAt)}</span>
              </p>
            </div>
            {page.description && <p className="text-foreground/90 mb-5 text-base">{page.description}</p>}
          </div>
        </div>
        {processedContent && (
          <>
            <hr className="border-border mt-5 pb-5" />
            <div
              className="tiptap prose prose-neutral dark:prose-invert mb-10 max-w-none"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </>
        )}
        <hr className="border-border mt-5 mb-8" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map(card => (
            <Link
              key={card.id}
              href={card.href}
              className="group border-border hover:bg-secondary/30 flex flex-col gap-1.5 rounded-lg border p-5 transition-colors"
            >
              <p className="text-md text-foreground font-semibold">{card.label}</p>
              {card.description && <p className="text-muted-foreground line-clamp-2 text-sm">{card.description}</p>}
            </Link>
          ))}
        </div>
        <Pagination navData={navData} />
        <Feedback />
      </div>
      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-28 flex flex-col gap-6">
          <TocAction docTitle={page.title} />
        </div>
      </aside>
    </div>
  )
}
