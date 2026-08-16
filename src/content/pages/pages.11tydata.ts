/**
 * Directory data for standalone pages. Each renders at /<filename>/, so adding
 * `texts.md` here is all it takes to make /texts/ exist.
 */

interface PageContext {
  readonly page: { readonly fileSlug: string }
}

export default {
  layout: 'page.webc',
  eleventyComputed: {
    permalink: ({ page }: PageContext): string => `/${page.fileSlug}/`,
  },
}
