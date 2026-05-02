import Link from 'next/link'
import EvocaveLogo from './ui/evocave-logo'

interface AppLogoProps {
  href: string | '/'
  sublogo: string
  height?: number
}

export default function AppLogo({ href, height = 20, sublogo }: AppLogoProps) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <EvocaveLogo height={height} />
      <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium uppercase">
        {sublogo}
      </span>
    </Link>
  )
}
