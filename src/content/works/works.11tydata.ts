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
    permalink: ({ page }: WorkContext): string => `/works/${page.fileSlug}/`,

    seriesUrl: ({ series, collections }: WorkContext): string | undefined => {
      if (series === undefined) return undefined
      return collections?.series?.find((page) => page.data.title === series)?.url
    },
  },
}
