import { notFound } from 'next/navigation'
import { getTopics, getDocTree, buildSidebarNavData } from './_actions/docs.actions'
import MobileSidebar from './_components/mobile-sidebar'
import Switcher from './_components/switcher'
import SidebarNav from './_components/sidebar-nav'
import DesktopSidebar from './_components/desktop-sidebar'

type Props = {
  children: React.ReactNode
  params: Promise<{ topic: string }> // ← ganti topicSlug → topic
}

export default async function TopicLayout({ children, params }: Props) {
  const { topic } = await params // ← ganti topicSlug → topic

  const [topicsResult, treeResult] = await Promise.all([
    getTopics(),
    getDocTree(topic), // ← ganti
  ])

  if (topicsResult.error || !topicsResult.data) notFound()
  if (treeResult.error || !treeResult.data) notFound()

  const topics = topicsResult.data
  const tree = treeResult.data
  const navData = buildSidebarNavData(tree, topic) // ← ganti

  return (
    <main className="mx-auto flex w-full flex-1 flex-col">
      <div className="lg:hidden">
        <MobileSidebar
          switcher={<Switcher topics={topics} currentTopicSlug={topic} />}
          nav={<SidebarNav navData={navData} />}
        />
      </div>

      <div className="mx-auto flex w-full max-w-350 flex-1 flex-row px-4 lg:px-6 lg:pt-12">
        <DesktopSidebar topics={topics} currentTopicSlug={topic} navData={navData} />

        <div className="w-full min-w-0 lg:px-6 lg:pl-12">
          <div className="pt-6 lg:pt-0">{children}</div>
        </div>
      </div>
    </main>
  )
}
