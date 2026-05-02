'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DocTopic } from '@/types/docs'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ─── Icon ─────────────────────────────────────────────────────────────────────

function TopicIcon({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <span className="text-muted-foreground text-xs font-bold">{alt.charAt(0)}</span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="size-6 object-contain" />
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  topics: DocTopic[]
  currentTopicSlug: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Switcher({ topics, currentTopicSlug }: Props) {
  const router = useRouter()

  const activeTopic = topics.find(t => t.slug === currentTopicSlug) ?? topics[0]

  if (!activeTopic) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-15 w-full items-center gap-2 rounded-[8px] p-2 text-left',
            'hover:bg-secondary/30 transition-colors',
            'data-[state=open]:bg-secondary/50',
            'focus-visible:outline-none',
            'border',
          )}
        >
          <div
            className={cn(
              'border-border flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border',
              'dark:bg-secondary/50 bg-foreground/80',
            )}
          >
            <TopicIcon src={activeTopic.icon} alt={activeTopic.title} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm leading-5 font-semibold">{activeTopic.title}</p>
            <p className="text-muted-foreground text-xs">{activeTopic.documentationCount} documentations</p>
          </div>
          <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn('border-border rounded-[8px] p-0')}
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
        align="start"
        sideOffset={6}
      >
        {topics.map((topic, i) => (
          <DropdownMenuItem
            key={topic.id}
            className={cn(
              'flex cursor-pointer items-center gap-2 px-2 py-3',
              'hover:bg-secondary/50 focus:bg-secondary/50 focus:text-foreground',
              i !== topics.length - 1 && 'border-border rounded-none border-b',
            )}
            onClick={() => router.push(`/${topic.slug}`)}
          >
            <div
              className={cn(
                'border-border flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                'dark:bg-secondary/50 bg-foreground/80',
              )}
            >
              <TopicIcon src={topic.icon} alt={topic.title} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm leading-5 font-semibold">{topic.title}</p>
              <p className="text-muted-foreground text-xs">{topic.documentationCount} documentations</p>
            </div>
            {topic.slug === currentTopicSlug && <Check className="text-foreground ml-auto size-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
