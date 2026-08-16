export interface SiteData {
  readonly title: string
  readonly description: string
  readonly lang: string
  readonly author: string
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
