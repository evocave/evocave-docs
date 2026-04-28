import { notFound } from 'next/navigation'
import { getTopics, getDocTree, buildSidebarNavData } from './_actions/docs.actions'
import Sidebar from './_components/sidebar'
import MobileSidebar from './_components/mobile-sidebar'
import Switcher from './_components/switcher'
import SidebarNav from './_components/sidebar-nav'

type Props = {
    children: React.ReactNode
    params: Promise<{ topicSlug: string }>
}

export default async function TopicLayout({ children, params }: Props) {
    const { topicSlug } = await params

    const [topicsResult, treeResult] = await Promise.all([
        getTopics(),
        getDocTree(topicSlug)
    ])

    if (topicsResult.error || !topicsResult.data) notFound()
    if (treeResult.error || !treeResult.data) notFound()

    const topics = topicsResult.data
    const tree = treeResult.data
    const navData = buildSidebarNavData(tree, topicSlug)

    return (
        <main className="w-full mx-auto flex flex-1 flex-col">
            <div className="lg:hidden">
                <MobileSidebar
                    switcher={
                        <Switcher
                            topics={topics}
                            currentTopicSlug={topicSlug}
                        />
                    }
                    nav={<SidebarNav navData={navData} />}
                />
            </div>

            <div className="w-full max-w-350 mx-auto flex flex-1 flex-row px-4 lg:px-6 lg:pt-12">
                <Sidebar
                    topics={topics}
                    currentTopicSlug={topicSlug}
                    navData={navData}
                />

                <div className="w-full min-w-0 lg:pl-12 lg:px-6">
                    <div className="pt-6 lg:pt-0">{children}</div>
                </div>
            </div>
        </main>
    )
}