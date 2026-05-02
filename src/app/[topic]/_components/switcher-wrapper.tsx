import { DocTopic } from '@/types/docs'
import Switcher from './switcher'

type Props = {
    topics: DocTopic[]
    currentTopicSlug: string
}

export default function SwitcherWrapper({ topics, currentTopicSlug }: Props) {
    return <Switcher topics={topics} currentTopicSlug={currentTopicSlug} />
}