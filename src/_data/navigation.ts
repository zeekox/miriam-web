/**
 * The site menu, structured after Daniela Keiser's information architecture:
 * a small number of top-level sections, with the work subdivided beneath one of
 * them, rather than a flat list of pages.
 *
 * Series are NOT listed here — they are derived from the works themselves in
 * `site-menu.webc`, so adding a work in a new series updates the menu with no
 * edit to this file. Everything here is the part that cannot be derived.
 */

export interface NavItem {
  readonly label: string
  /** Site-rooted path. Passed through Eleventy's `url` filter at render time. */
  readonly href: string
}

export interface NavSection {
  readonly label: string
  /** Optional landing page for the section heading itself. */
  readonly href?: string
  readonly children?: readonly NavItem[]
  /**
   * When true, the derived list of series is inserted beneath this section's
   * own children. Exactly one section should set it.
   */
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
    label: 'Biography',
    href: '/biography/',
  },
  {
    label: 'Information',
    href: '/information/',
  },
]

export default navigation
