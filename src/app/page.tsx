import { redirect } from 'next/navigation'
import { getTopics } from './[topicSlug]/_actions/docs.actions'

export default async function Home() {
    const result = await getTopics()
    if (result.data && result.data.length > 0) {
        redirect(`/${result.data[0].slug}`)
    }
    redirect('/elementor-template-kits')
}