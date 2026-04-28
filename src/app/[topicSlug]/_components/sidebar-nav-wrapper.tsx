import { SidebarNavData } from '@/types/docs'
import SidebarNav from './sidebar-nav'

type Props = {
    navData: SidebarNavData
}

export default function SidebarNavWrapper({ navData }: Props) {
    return <SidebarNav navData={navData} />
}