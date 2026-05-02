'use client'

import { incrementView } from '../_actions/docs.actions'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'

type Props = {
  nodeId: string
  initialViews: number
}

export default function ViewCount({ nodeId, initialViews }: Props) {
  const [views, setViews] = useState<number>(initialViews)

  useEffect(() => {
    const cookieKey = `viewed:${nodeId}`
    const alreadyViewed = Cookies.get(cookieKey)

    if (!alreadyViewed) {
      incrementView(nodeId).then(result => {
        if (!result.error) {
          // expires: 1 = 24 jam
          Cookies.set(cookieKey, '1', { expires: 1 })
          setViews(prev => prev + 1)
        }
      })
    }
  }, [nodeId])

  return (
    <span>
      {views.toLocaleString()} {views === 1 ? 'view' : 'views'}
    </span>
  )
}
