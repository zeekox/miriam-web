/**
 * Directory data for every work. Applies to all .md files in this folder, so an
 * individual work's front matter only ever carries content — never plumbing.
 */

interface PermalinkContext {
  readonly page: { readonly fileSlug: string }
}

export default {
  layout: 'work.webc',
  tags: 'works',
  eleventyComputed: {
    // A function rather than a template string: the page templating language is
    // WebC, which has no {{ }} interpolation to resolve a permalink with.
    permalink: ({ page }: PermalinkContext): string => `/works/${page.fileSlug}/`,
  },
}
