export function sanitizeContent(html: string): string {
    return html
        .replace(/&nbsp;/g, ' ')
        .trim()
}

export function addHeadingIds(html: string): string {
    const idCount: Record<string, number> = {}

    return html.replace(
        /<(h[23])[^>]*>(.*?)<\/h[23]>/gi,
        (_match, tag, text) => {
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
        }
    )
}