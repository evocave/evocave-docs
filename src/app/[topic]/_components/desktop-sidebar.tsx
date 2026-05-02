'use client'

import SwitcherWrapper from './switcher-wrapper'
import SidebarNavWrapper from './sidebar-nav-wrapper'
import { DocTopic, SidebarNavData } from '@/types/docs'

type Props = {
  topics: DocTopic[]
  currentTopicSlug: string
  navData: SidebarNavData
}

export default function DesktopSidebar({ topics, currentTopicSlug, navData }: Props) {
  return (
    <div className="sticky top-28 hidden h-[calc(100svh-10rem)] w-full max-w-71.5 flex-col overscroll-none bg-transparent lg:flex print:hidden">
      <div className="relative flex h-full flex-col gap-6">
        <div className="pr-6">
          <SwitcherWrapper topics={topics} currentTopicSlug={currentTopicSlug} />
        </div>

        <div className="from-background pointer-events-none absolute top-16 right-0 left-0 z-20 h-8 bg-linear-to-b to-transparent" />
        {/* Scroll area + blur dalam satu wrapper relative */}
        <div className="relative flex-1 overflow-hidden">
          {/* Blur top */}

          {/* Scrollable content */}
          <div className="__hide-scrollbar h-full overflow-y-auto pr-6">
            <SidebarNavWrapper navData={navData} />
          </div>

          {/* Blur bottom */}
          <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-16 bg-linear-to-t to-transparent" />
        </div>
      </div>

      {/* border kanan */}
      <div className="via-border absolute top-12 right-0 bottom-0 hidden h-full w-px bg-linear-to-b from-transparent to-transparent lg:flex" />
    </div>
  )
}
