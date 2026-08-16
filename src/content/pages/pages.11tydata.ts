interface PageContext {
  readonly page: { readonly fileSlug: string }
}

export default {
  layout: 'page.webc',
  eleventyComputed: {
    permalink: ({ page }: PageContext): string => `/${page.fileSlug}/`,
  },
}
