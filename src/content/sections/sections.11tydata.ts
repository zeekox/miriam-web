interface SectionContext {
  readonly page: { readonly fileSlug: string }
}

export default {
  layout: 'section.webc',
  tags: 'sections',
  eleventyComputed: {
    permalink: ({ page }: SectionContext): string => `/${page.fileSlug}/`,
  },
}
