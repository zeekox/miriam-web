export interface NavItem {
  readonly label: string
  readonly href: string
}

export interface NavSection {
  readonly label: string
  readonly href?: string
  readonly children?: readonly NavItem[]
  readonly includeSections?: boolean
}

const navigation: readonly NavSection[] = [
  {
    label: 'Works',
    href: '/works/',
    includeSections: true,
  },
  {
    label: 'Texts',
    href: '/texts/',
  },
  {
    label: 'About',
    href: '/about/',
  },
]

export default navigation
