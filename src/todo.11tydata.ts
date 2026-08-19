interface WorkImage {
  readonly src: string
  readonly alt: string
}

interface WorkEntry {
  readonly title: string
  readonly url: string
  readonly image: string
  readonly alt: string
  readonly images?: readonly WorkImage[]
}

interface TodoContext {
  readonly collections: { readonly works?: readonly WorkEntry[] }
}

export default {
  eleventyComputed: {
    altRows: ({ collections }: TodoContext) =>
      (collections.works ?? []).flatMap((work) =>
        [{ src: work.image, alt: work.alt }, ...(work.images ?? [])].map((image) => ({
          title: work.title,
          url: work.url,
          file: image.src.split('/').pop(),
          alt: image.alt,
        })),
      ),
  },
}
