'use client'

import { ThumbsDown, ThumbsUp, Mail } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function Feedback() {
  const [helpful, setHelpful] = useState<boolean | null>(null)

  return (
    <div className="docs-feedback border-border mt-12 flex flex-col items-center justify-center gap-4 border-t pt-6 pb-20 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Mail className="size-4 shrink-0" />
        <span>Still stuck?</span>
        <Link href="https://help.evocave.com" target="_blank" className="text-foreground font-medium hover:underline">
          How can we help?
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {helpful === null ? (
          <>
            <span className="text-muted-foreground text-sm">Was this page helpful?</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHelpful(true)}
                className="hover:bg-secondary/50 text-muted-foreground rounded-lg p-2 transition-colors hover:text-green-500"
                title="Yes"
              >
                <ThumbsUp className="size-4" />
              </button>
              <button
                onClick={() => setHelpful(false)}
                className="hover:bg-secondary/50 text-muted-foreground rounded-lg p-2 transition-colors hover:text-red-500"
                title="No"
              >
                <ThumbsDown className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground text-sm">Thanks for your feedback!</span>
        )}
      </div>
    </div>
  )
}
