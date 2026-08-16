interface SeriesContext {
  readonly page: { readonly fileSlug: string }
}

export default {
  layout: 'series.webc',
  tags: 'series',
  eleventyComputed: {
    permalink: ({ page }: SeriesContext): string => `/series/${page.fileSlug}/`,
  },
}
