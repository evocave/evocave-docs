import { apiFetch } from '@/types/api'
import {  DocTopic,
    DocTree,
    DocTreeNode,
    DocPage,
    SidebarNavData,
    SidebarSection,
    SidebarIndustry,
    SidebarArticle } from '@/types/docs'


const API_URL = process.env.NEXT_PUBLIC_API_URL

// ─── GET /docs/topics ─────────────────────────────────────────────────────────

export async function getTopics() {
    return apiFetch<DocTopic[]>(`${API_URL}/docs/topics`, {
        next: { revalidate: 3600 }
    })
}

// ─── GET /docs/nodes/:topicSlug ───────────────────────────────────────────────

export async function getDocTree(topicSlug: string) {
    return apiFetch<DocTree>(`${API_URL}/docs/nodes/${topicSlug}`, {
        next: { revalidate: 3600 }
    })
}

// ─── GET /docs/page/:topicSlug/* ─────────────────────────────────────────────

export async function getDocPage(
    topicSlug: string,
    slugPath: string,
    locale?: string
) {
    const url = new URL(`${API_URL}/docs/page/${topicSlug}/${slugPath}`)
    if (locale && locale !== 'en') url.searchParams.set('locale', locale)

    return apiFetch<DocPage>(url.toString(), {
        next: { revalidate: 3600 }
    })
}

// ─── POST /docs/page/:id/view ─────────────────────────────────────────────────

export async function incrementView(nodeId: string) {
    return apiFetch<{ ok: boolean }>(`${API_URL}/docs/page/${nodeId}/view`, {
        method: 'POST',
        cache: 'no-store'
    })
}

// ─── POST /docs/page/:id/helpful ─────────────────────────────────────────────

export async function voteHelpful(nodeId: string, vote: 'yes' | 'no') {
    return apiFetch<{ ok: boolean }>(`${API_URL}/docs/page/${nodeId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
        cache: 'no-store'
    })
}

// ─── POST /docs/nodes/:id/translate ──────────────────────────────────────────

export async function triggerTranslation(nodeId: string, locale: string) {
    return apiFetch<{ cached: boolean; locale: string }>(
        `${API_URL}/docs/nodes/${nodeId}/translate`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale }),
            cache: 'no-store'
        }
    )
}

// ─── Transform DocTree → SidebarNavData ──────────────────────────────────────
// Sesuai PRD: article langsung di bawah section (tanpa industry)
// tidak tampil di sidebar, tapi tampil sebagai card di halaman section.

export function buildSidebarNavData(
    tree: DocTree,
    topicSlug: string
): SidebarNavData {
    const sections: SidebarSection[] = tree.children
        .filter((node: DocTreeNode) => node.type === 'section')
        .map((section: DocTreeNode) => {
            const directArticles: SidebarArticle[] = section.children
                .filter((child: DocTreeNode) => child.type === 'article')
                .map((article: DocTreeNode) => ({
                    id: article.id,
                    title: article.title,
                    slug: article.slug,
                    href: `/${topicSlug}/${section.slug}/${article.slug}`
                }))

            const industries: SidebarIndustry[] = section.children
                .filter((child: DocTreeNode) => child.type === 'industry')
                .map((industry: DocTreeNode) => ({
                    id: industry.id,
                    title: industry.title,
                    slug: industry.slug,
                    articles: industry.children
                        .filter((child: DocTreeNode) => child.type === 'article')
                        .map((article: DocTreeNode) => ({
                            id: article.id,
                            title: article.title,
                            slug: article.slug,
                            href: `/${topicSlug}/${section.slug}/${industry.slug}/${article.slug}`
                        }))
                }))

            return {
                id: section.id,
                title: section.title,
                slug: section.slug,
                directArticles,
                industries
            }
        })

    return {
        topicSlug,
        topicTitle: tree.title,
        sections
    }
}