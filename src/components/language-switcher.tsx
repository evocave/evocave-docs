'use client'

import { useLang } from '@/context/languageContext'
import { cn } from '@/lib/utils'
import { ChevronUp } from 'lucide-react'
import { useState } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'id', label: 'Indonesia', short: 'ID' },
  { code: 'ja', label: '日本語', short: 'JA' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'zh', label: '简体中文', short: 'ZH' },
  { code: 'ko', label: '한국어', short: 'KO' },
  { code: 'ar', label: 'العربية', short: 'AR' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const activeLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-muted-foreground hover:text-foreground border-border flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
      >
        <span className="text-xs font-medium">{activeLang.short}</span>
        <span>{activeLang.label}</span>
        <ChevronUp className={cn('size-3.5 transition-transform', open ? 'rotate-0' : 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="bg-background border-border absolute right-0 bottom-full z-50 mb-2 w-64 overflow-hidden rounded-xl border shadow-lg">
            <div className="grid grid-cols-2 gap-0.5 p-2">
              {LANGUAGES.map(language => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLang(language.code)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-1 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    lang === language.code
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                  )}
                >
                  <span className="w-6 shrink-0 text-xs font-semibold">{language.short}</span>
                  <span className="truncate">{language.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
