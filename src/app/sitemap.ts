import { MetadataRoute } from 'next'
import { getTopics, getDocTree } from '@/app/[topic]/_actions/docs.actions'

const BASE_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.evocave.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  try {
    const topicsResult = await getTopics()
    if (topicsResult.error || !topicsResult.data) return urls

    for (const topic of topicsResult.data) {
      // Topic page
      urls.push({
        url: `${BASE_URL}/${topic.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      })

      // Tree per topic
      const treeResult = await getDocTree(topic.slug)
      if (treeResult.error || !treeResult.data) continue

      type TreeNode = { slug: string; type: string; children?: TreeNode[] }
      const traverse = (nodes: TreeNode[], parentPath: string) => {
        for (const node of nodes) {
          const path = `${parentPath}/${node.slug}`
          urls.push({
            url: `${BASE_URL}${path}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: node.type === 'article' ? 0.7 : 0.8,
          })
          if (node.children && node.children.length > 0) {
            traverse(node.children, path)
          }
        }
      }

      traverse(treeResult.data.children ?? [], `/${topic.slug}`)
    }
  } catch {
    // return partial sitemap jika ada error
  }

  return urls
}
