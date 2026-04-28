import SwitcherWrapper from './switcher-wrapper'
import SidebarNavWrapper from './sidebar-nav-wrapper'
import { DocTopic, SidebarNavData } from '@/types/docs'

type Props = {
    topics: DocTopic[]
    currentTopicSlug: string
    navData: SidebarNavData
}

export default function Sidebar({ topics, currentTopicSlug, navData }: Props) {
    return (
        <div className="max-w-71.5 w-full flex-col sticky top-28 h-[calc(100svh-10rem)] overscroll-none bg-transparent hidden lg:flex">
            <div className="flex flex-col gap-4 h-full">
                <SwitcherWrapper topics={topics} currentTopicSlug={currentTopicSlug} />
                <SidebarNavWrapper navData={navData} />
                <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-linear-to-t from-background to-transparent" />
                <div className="absolute top-12 right-0 bottom-0 hidden h-full w-px bg-linear-to-b from-transparent via-border to-transparent lg:flex" />
            </div>
        </div>
    )
}