'use client'

import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/context/languageContext'
import { triggerTranslation, getDocPageClient } from '../_actions/docs.actions'
import { addHeadingIds, sanitizeContent } from '@/lib/docs-content'
import { DocPage } from '@/types/docs'
import ViewCount from './view-count'

type Props = {
  page: DocPage
  processedContent: string
  topicSlug: string
  slugPath: string
  readingTime: string
  formattedDate: string
}

export default function ArticleContent({
  page,
  processedContent,
  topicSlug,
  slugPath,
  readingTime,
  formattedDate,
}: Props) {
  const { lang } = useLang()

  const [title, setTitle] = useState(page.title)
  const [description, setDescription] = useState(page.description)
  const [content, setContent] = useState(processedContent)
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // ─── Fetch translated content saat lang berubah ───────────────────────────
  useEffect(() => {
    if (lang === 'en') {
      setTitle(page.title)
      setDescription(page.description)
      setContent(processedContent)
      return
    }

    setLoading(true)

    triggerTranslation(page.id, lang)
      .then(() => getDocPageClient(topicSlug, slugPath, lang))
      .then(result => {
        if (!result.error && result.data) {
          const translated = result.data
          setTitle(translated.title)
          setDescription(translated.description)
          const processed = addHeadingIds(sanitizeContent(translated.content ?? ''))
          setContent(processed)
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [lang, page.id, page.title, page.description, processedContent, topicSlug, slugPath])

  // ─── Highlight.js syntax highlighting + copy button ──────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const loadHljs = async () => {
      const hljs = (await import('highlight.js')).default

      container.querySelectorAll('pre code').forEach(el => {
        hljs.highlightElement(el as HTMLElement)
      })

      container.querySelectorAll('pre').forEach(pre => {
        if (pre.querySelector('.copy-btn')) return
        pre.style.position = 'relative'

        const button = document.createElement('button')
        button.className = 'copy-btn'
        button.setAttribute('aria-label', 'Copy code')
        button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
        button.style.cssText = `position:absolute;top:0.75rem;right:0.75rem;padding:0.375rem;border-radius:0.375rem;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;opacity:0;`

        pre.addEventListener('mouseenter', () => {
          button.style.opacity = '1'
        })
        pre.addEventListener('mouseleave', () => {
          button.style.opacity = '0'
        })

        button.addEventListener('click', async () => {
          const code = pre.querySelector('code')
          const text = code?.innerText ?? pre.innerText
          try {
            await navigator.clipboard.writeText(text)
            button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
            button.style.color = 'rgba(255,255,255,0.9)'
            setTimeout(() => {
              button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
              button.style.color = 'rgba(255,255,255,0.5)'
            }, 2000)
          } catch {
            // clipboard not available
          }
        })

        pre.appendChild(button)
      })
    }

    loadHljs()
  }, [content])

  return (
    <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="mt-2 mb-3 text-2xl font-bold lg:text-4xl">{title}</h1>
          <p className="text-muted-foreground mb-5 flex items-center gap-1.5 text-sm">
            <span>{readingTime}</span>
            <span>·</span>
            <ViewCount nodeId={page.id} initialViews={page.meta.views} />
            <span>·</span>
            <span>Updated on {formattedDate}</span>
          </p>
        </div>
        {description && <p className="text-foreground/90 mb-5 text-base">{description}</p>}
      </div>
      <hr className="border-border mt-5 pb-5" />
      <div
        ref={containerRef}
        className="tiptap prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
