// ─── Node Types ───────────────────────────────────────────────────────────────

export type DocNodeType = 'topic' | 'section' | 'industry' | 'article'
export type DocNodeStatus = 'draft' | 'published'
export type DocLocale = 'en' | 'id' | 'ja' | 'de' | 'fr' | 'es' | 'pt' | 'zh' | 'ko' | 'ar'

// ─── GET /docs/topics ─────────────────────────────────────────────────────────

export type DocTopic = {
  id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  icon: string | null
  order: number
  documentationCount: number
}

// ─── GET /docs/nodes/:topicSlug ───────────────────────────────────────────────

export type DocTreeNode = {
  id: string
  type: DocNodeType
  title: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  children: DocTreeNode[]
}

export type DocTree = {
  id: string
  title: string
  slug: string
  description: string | null
  icon: string | null
  children: DocTreeNode[]
}

// ─── GET /docs/page/:topicSlug/* ─────────────────────────────────────────────

export type DocPageMeta = {
  views: number
  helpfulYes: number
  helpfulNo: number
}

export type DocPage = {
  id: string
  type: DocNodeType
  title: string
  slug: string
  description: string | null
  content: string | null
  updatedAt: string
  meta: DocPageMeta
}

// ─── Sidebar navigation (derived dari DocTree) ────────────────────────────────

export type SidebarArticle = {
  id: string
  title: string
  slug: string
  href: string
  description: string | null
}

export type SidebarIndustry = {
  id: string
  title: string
  slug: string
  articles: SidebarArticle[]
  description: string | null
}

export type SidebarSection = {
  id: string
  title: string
  slug: string
  description: string | null
  directArticles: SidebarArticle[]
  industries: SidebarIndustry[]
}

export type SidebarNavData = {
  topicSlug: string
  topicTitle: string
  sections: SidebarSection[]
}
