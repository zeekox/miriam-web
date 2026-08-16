/**
 * Site metadata. Deliberately contains no styling values — no colours, no fonts,
 * no spacing. Presentation lives in CSS, which is the artist's to author.
 */

export interface SiteData {
  readonly title: string
  readonly description: string
  readonly lang: string
  readonly author: string
  /** Absolute origin, used for canonical URLs. No trailing slash. */
  readonly url: string
}

const site: SiteData = {
  title: 'Miriam',
  description: 'Paintings and drawings.',
  lang: 'en',
  author: 'Miriam',
  url: process.env['SITE_URL'] ?? 'http://localhost:8080',
}

export default site
