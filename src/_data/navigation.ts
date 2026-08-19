export interface NavItem {
  readonly label: string
  readonly href: string
}

export interface NavSection {
  readonly label: string
  readonly href?: string
  readonly children?: readonly NavItem[]
  readonly includeSeries?: boolean
}

const navigation: readonly NavSection[] = [
  {
    label: 'Works',
    href: '/works/',
    includeSeries: true,
  },
  {
    label: 'Texts',
    href: '/texts/',
  },
  {
    label: 'About',
    href: '/about/',
  },
  {
    label: 'Information',
    href: '/information/',
  },
]

export default navigation
