'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { Search, FileText, FolderOpen, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface SearchHit {
  id: string
  title: string
  slug: string
  type: string
  description: string | null
  topicSlug: string
  topicTitle: string
  breadcrumb: string
  url: string
  _formatted?: {
    title?: string
    description?: string
    content?: string
  }
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'article') return <FileText className="size-3.5 shrink-0 text-blue-500" />
  if (type === 'industry') return <FolderOpen className="size-3.5 shrink-0 text-amber-500" />
  return <Hash className="text-muted-foreground size-3.5 shrink-0" />
}

function highlight(text: string) {
  return text.replace(/<mark>/g, '<mark class="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded px-0.5">')
}

export default function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const router = useRouter()

  // Ctrl+K / Cmd+K + CustomEvent dari header
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    const eventHandler = () => setOpen(true)
    window.addEventListener('keydown', keyHandler)
    document.addEventListener('open-docs-search', eventHandler)
    return () => {
      window.removeEventListener('keydown', keyHandler)
      document.removeEventListener('open-docs-search', eventHandler)
    }
  }, [])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setHits([])
      setSelected(0)
    }
  }, [open])

  // Search
  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([])
      return
    }
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/docs/search?q=${encodeURIComponent(query)}&limit=8`)
        const data = await res.json()
        setHits(data.hits ?? [])
        setSelected(0)
      } catch {
        setHits([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const navigate = useCallback(
    (hit: SearchHit) => {
      router.push(hit.url)
      setOpen(false)
    },
    [router],
  )

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(s => Math.min(s + 1, hits.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(s => Math.max(s - 1, 0))
      }
      if (e.key === 'Enter' && hits[selected]) navigate(hits[selected])
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, hits, selected, navigate])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 lg:max-w-xl">
        <VisuallyHidden.Root>
          <DialogTitle>Search Documentation</DialogTitle>
        </VisuallyHidden.Root>
        {/* Search input */}
        <div className="border-border flex items-center gap-3 border-b px-4 py-3">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
          />
          {loading && <div className="border-primary size-4 animate-spin rounded-full border-2 border-t-transparent" />}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {hits.length > 0 ? (
            <ul className="p-2">
              {hits.map((hit, i) => (
                <li key={hit.id}>
                  <button
                    onClick={() => navigate(hit)}
                    onMouseEnter={() => setSelected(i)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      selected === i ? 'bg-secondary' : 'hover:bg-secondary/50',
                    )}
                  >
                    <TypeIcon type={hit.type} />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-foreground truncate text-sm font-medium"
                        dangerouslySetInnerHTML={{
                          __html: highlight(hit._formatted?.title ?? hit.title),
                        }}
                      />
                      {hit._formatted?.description && (
                        <p
                          className="text-muted-foreground mt-0.5 line-clamp-1 text-xs"
                          dangerouslySetInnerHTML={{
                            __html: highlight(hit._formatted.description),
                          }}
                        />
                      )}
                      <p className="text-muted-foreground/60 mt-1 text-xs">{hit.breadcrumb}</p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs capitalize">{hit.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 2 && !loading ? (
            <div className="text-muted-foreground px-4 py-10 text-center text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="text-muted-foreground px-4 py-10 text-center text-sm">
              Type at least 2 characters to search...
            </div>
          )}
        </div>

        {/* Footer */}
        {hits.length > 0 && (
          <div className="border-border text-muted-foreground flex items-center gap-4 border-t px-4 py-2 text-xs">
            <span>
              <kbd className="bg-muted rounded px-1">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="bg-muted rounded px-1">↵</kbd> select
            </span>
            <span>
              <kbd className="bg-muted rounded px-1">Esc</kbd> close
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
