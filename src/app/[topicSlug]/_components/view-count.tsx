'use client'

import { incrementView } from '../_actions/docs.actions'
import { useEffect, useState } from 'react'

type Props = {
    nodeId: string
}

export default function ViewCount({ nodeId }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [views, setViews] = useState<number | null>(null)

    useEffect(() => {
        const sessionKey = `viewed:${nodeId}`
        const alreadyViewed = sessionStorage.getItem(sessionKey)

        if (!alreadyViewed) {
            incrementView(nodeId).then((result) => {
                if (!result.error) {
                    sessionStorage.setItem(sessionKey, '1')
                }
            })
        }
    }, [nodeId])

    if (views === null) return null

    return (
        <span>
            · {views.toLocaleString()} {views === 1 ? 'view' : 'views'}
        </span>
    )
}