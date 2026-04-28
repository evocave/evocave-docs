import { notFound } from 'next/navigation'
import { getTopics, getDocTree, buildSidebarNavData } from './_actions/docs.actions'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{ topicSlug: string }>
}

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.evocave.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { topicSlug } = await params
    const result = await getTopics()
    if (result.error || !result.data) return { title: 'Evocave Docs' }

    const topic = result.data.find((t) => t.slug === topicSlug)
    if (!topic) return { title: 'Evocave Docs' }

    return {
        title: `${topic.title} — Evocave Docs`,
        description: topic.description ?? undefined,
        openGraph: {
            title: `${topic.title} — Evocave Docs`,
            description: topic.description ?? undefined,
            url: `${BASE_URL}/${topicSlug}`,
            siteName: 'Evocave Docs',
            type: 'website'
        }
    }
}

export default async function TopicPage({ params }: Props) {
    const { topicSlug } = await params

    const [topicsResult, treeResult] = await Promise.all([
        getTopics(),
        getDocTree(topicSlug)
    ])

    if (topicsResult.error || !topicsResult.data) notFound()
    if (treeResult.error || !treeResult.data) notFound()

    const topic = topicsResult.data.find((t) => t.slug === topicSlug)
    if (!topic) notFound()

    const navData = buildSidebarNavData(treeResult.data, topicSlug)

    return (
        <div className="flex gap-6 lg:gap-12">
            <div className="flex-1 min-w-0 pr-0 lg:pr-16">
                <h1 className="text-3xl lg:text-4xl font-bold mt-2 mb-3">
                    {topic.title}
                </h1>
                {topic.description && (
                    <p className="text-sm text-muted-foreground mb-8">
                        {topic.description}
                    </p>
                )}

                <hr className="border-border mb-8" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {navData.sections.map((section) => (
                        <Link
                            key={section.id}
                            href={`/${topicSlug}/${section.slug}`}
                            className="group flex flex-col gap-1.5 p-5 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                        >
                            <p className="text-md font-semibold text-foreground">
                                {section.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {section.industries.length > 0
                                    ? `${section.industries.length} categories`
                                    : `${section.directArticles.length} articles`}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}