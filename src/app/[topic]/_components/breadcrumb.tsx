import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: Props) {
  const lastIndex = items.length - 1

  const mobileItems = items.length > 2 ? [items[0], { label: '...', href: undefined }, items[lastIndex]] : items

  const renderItem = (item: BreadcrumbItem, i: number, arr: BreadcrumbItem[]) => {
    const isLast = i === arr.length - 1
    const isEllipsis = item.label === '...'

    return (
      <span key={i} className="flex min-w-0 items-center gap-1.5">
        {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
        {isEllipsis ? (
          <span className="text-muted-foreground capitalize">...</span>
        ) : item.href ? (
          <Link href={item.href} className="hover:text-foreground max-w-24 truncate capitalize transition-colors">
            {item.label}
          </Link>
        ) : isLast ? (
          <span className="text-foreground max-w-32 truncate font-medium capitalize">{item.label}</span>
        ) : (
          <span className="max-w-24 truncate">{item.label}</span>
        )}
      </span>
    )
  }

  return (
    <nav className="text-muted-foreground mb-4 flex min-w-0 items-center gap-1.5 text-sm print:hidden">
      <span className="flex min-w-0 items-center gap-1.5 overflow-hidden lg:hidden">
        {mobileItems.map((item, i) => renderItem(item, i, mobileItems))}
      </span>
      <span className="hidden items-center gap-1.5 lg:flex">{items.map((item, i) => renderItem(item, i, items))}</span>
    </nav>
  )
}
