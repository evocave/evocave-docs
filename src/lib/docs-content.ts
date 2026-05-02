import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'

const extensions = [StarterKit, Link.configure({ openOnClick: false }), Image]

export function isTiptapJson(content: string): boolean {
  try {
    const parsed = JSON.parse(content)
    return parsed?.type === 'doc' && Array.isArray(parsed?.content)
  } catch {
    return false
  }
}

export function tiptapToHtml(content: string): string {
  try {
    const json = JSON.parse(content)
    return generateHTML(json, extensions)
  } catch {
    return content
  }
}

export function sanitizeContent(content: string): string {
  const html = isTiptapJson(content) ? tiptapToHtml(content) : content
  return html.replace(/&nbsp;/g, ' ').trim()
}

export function addHeadingIds(html: string): string {
  const idCount: Record<string, number> = {}

  return html.replace(/<(h[23])[^>]*>(.*?)<\/h[23]>/gi, (_match, tag, text) => {
    const plainText = text.replace(/<[^>]+>/g, '')
    const baseId = plainText
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    let id = baseId
    if (idCount[baseId] !== undefined) {
      idCount[baseId]++
      id = `${baseId}-${idCount[baseId]}`
    } else {
      idCount[baseId] = 0
    }

    return `<${tag} id="${id}" style="scroll-margin-top: 112px">${text}</${tag}>`
  })
}
