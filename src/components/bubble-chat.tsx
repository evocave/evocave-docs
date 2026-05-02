'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/context/languageContext'
import { cn } from '@/lib/utils'
import { MessageCircle, X, Bot, BookOpen, ExternalLink, Send, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const HELP_URL = process.env.NEXT_PUBLIC_HELP_URL ?? 'https://help.evocave.com'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SearchHit {
  id: string
  title: string
  type: string
  topicTitle: string
  breadcrumb: string
  url: string
}

export default function BubbleChat() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'ai' | 'kb'>('ai')
  const { lang } = useLang()

  // AI tab state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // KB tab state
  const [kbQuery, setKbQuery] = useState('')
  const [kbHits, setKbHits] = useState<SearchHit[]>([])
  const [kbLoading, setKbLoading] = useState(false)

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // KB search debounce
  useEffect(() => {
    if (kbQuery.trim().length < 2) {
      setKbHits([])
      return
    }
    const t = setTimeout(async () => {
      setKbLoading(true)
      try {
        const res = await fetch(`${API_URL}/docs/search?q=${encodeURIComponent(kbQuery)}&limit=6`)
        const data = await res.json()
        setKbHits(data.hits ?? [])
      } catch {
        setKbHits([])
      } finally {
        setKbLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [kbQuery])

  const sendMessage = async () => {
    if (!input.trim() || aiLoading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAiLoading(true)

    try {
      const res = await fetch(`${API_URL}/docs/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          lang,
        }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply ?? 'Sorry, I could not process your request.' },
      ])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="bg-background border-border flex h-120 w-80 flex-col overflow-hidden rounded-2xl border shadow-2xl">
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex size-7 items-center justify-center rounded-full">
                <Bot className="text-primary size-4" />
              </div>
              <span className="text-sm font-semibold">Evocave Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-border flex border-b">
            {(['ai', 'kb'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
                  tab === t ? 'border-primary text-primary border-b-2' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t === 'ai' ? (
                  <>
                    <Bot className="size-3.5" /> AI Assistant
                  </>
                ) : (
                  <>
                    <BookOpen className="size-3.5" /> Knowledge Base
                  </>
                )}
              </button>
            ))}
          </div>

          {/* AI Tab */}
          {tab === 'ai' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {messages.length === 0 && (
                  <div className="text-muted-foreground mt-8 text-center text-xs">
                    <Bot className="mx-auto mb-2 size-8 opacity-30" />
                    <p>Ask me anything about Evocave products and documentation.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-secondary text-foreground rounded-bl-sm',
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl rounded-bl-sm px-3 py-2">
                      <Loader2 className="text-muted-foreground size-3.5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-border border-t p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask a question..."
                    className="placeholder:text-muted-foreground flex-1 bg-transparent text-xs outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || aiLoading}
                    className="text-primary disabled:text-muted-foreground transition-colors"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KB Tab */}
          {tab === 'kb' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="border-border border-b px-3 py-2">
                <input
                  value={kbQuery}
                  onChange={e => setKbQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="placeholder:text-muted-foreground w-full bg-transparent text-xs outline-none"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {kbLoading && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="text-muted-foreground size-4 animate-spin" />
                  </div>
                )}
                {!kbLoading && kbHits.length > 0 && (
                  <ul className="space-y-1">
                    {kbHits.map(hit => (
                      <li key={hit.id}>
                        <a
                          href={hit.url}
                          className="hover:bg-secondary flex flex-col gap-0.5 rounded-lg px-3 py-2 transition-colors"
                        >
                          <span className="text-foreground text-xs font-medium">{hit.title}</span>
                          <span className="text-muted-foreground text-xs">{hit.breadcrumb}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {!kbLoading && kbQuery.length >= 2 && kbHits.length === 0 && (
                  <p className="text-muted-foreground py-6 text-center text-xs">No articles found.</p>
                )}
                {!kbLoading && kbQuery.length < 2 && (
                  <p className="text-muted-foreground mt-4 text-center text-xs">Type to search articles...</p>
                )}
              </div>
              {/* Open a ticket */}
              <div className="border-border border-t p-3">
                <a
                  href={HELP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="size-3.5" />
                  Open a ticket
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </div>
  )
}
