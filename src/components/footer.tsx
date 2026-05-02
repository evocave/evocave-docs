'use client'

import Link from 'next/link'
import LanguageSwitcher from './language-switcher'
import AppLogo from './app-logo'

const MENU = [
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/' },
      { label: 'Support Policy', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'Templates', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Evocave', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#t' },
      { label: 'Careers', href: '#', soon: true },
    ],
  },
  {
    title: 'Market',
    links: [
      { label: 'Envato Elements', href: '#', soon: true },
      {
        label: 'Themeforest',
        href: 'https://themeforest.net/user/evocave',
      },
      { label: 'Figma Community', href: '#', soon: true },
      { label: 'Ui8', href: '#', soon: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-border mt-12 w-full border-t">
      <div className="mx-auto w-full max-w-350 px-4 py-10 lg:px-6">
        {/* Menu columns */}
        <div className="flex flex-col justify-between gap-8 lg:flex-row">
          <div className="flex items-start">
            <AppLogo href="/" height={20} sublogo="docs" />
          </div>
          <div className="mb-10 grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10">
            {MENU.map(col => (
              <div key={col.title}>
                <p className="text-foreground mb-4 text-sm font-semibold">{col.title}</p>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground flex h-6 items-center gap-2 text-sm transition-colors"
                      >
                        {link.label}
                        {link.soon && (
                          <div className="flex items-center rounded-none bg-linear-to-tr from-[#CC7A00] to-[#FF9900] px-1.5 py-0.5">
                            <span className="text-foreground text-[10px] font-medium">SOON</span>
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border flex flex-col-reverse items-center gap-6 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Evocave. All rights reserved.</p>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
            {/* Language switcher */}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
