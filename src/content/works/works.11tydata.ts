/**
 * Directory data for every work. Applies to all .md files in this folder, so an
 * individual work's front matter only ever carries content — never plumbing.
 */

interface SeriesPage {
  readonly url: string
  readonly data: { readonly title?: string }
}

interface WorkContext {
  readonly page: { readonly fileSlug: string }
  readonly series?: string
  readonly collections?: { readonly series?: readonly SeriesPage[] }
}

export default {
  layout: 'work.webc',
  tags: 'works',
  eleventyComputed: {
    // A function rather than a template string: the page templating language is
    // WebC, which has no {{ }} interpolation to resolve a permalink with.
    permalink: ({ page }: WorkContext): string => `/works/${page.fileSlug}/`,

    /**
     * URL of this work's series page, or undefined if there isn't one.
     *
     * Resolved by looking the page up by title rather than by slugifying the
     * title into a guessed URL, so naming a series file differently from its
     * title cannot produce a link to a page that does not exist.
     *
     * Computed here rather than in the template because `webc:setup` bindings
     * are not visible to the surrounding markup, and eleventyComputed does
     * receive `collections`.
     */
    seriesUrl: ({ series, collections }: WorkContext): string | undefined => {
      if (series === undefined) return undefined
      return collections?.series?.find((page) => page.data.title === series)?.url
    },
  },
}
