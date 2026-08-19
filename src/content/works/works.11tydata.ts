import { formatWorkMeta } from '../../../types/content.ts'

const UNBOUNDED_ASPECT = 99

interface RawDimensions {
  readonly height_cm?: number
  readonly width_cm?: number
}

interface SectionPage {
  readonly url: string
  readonly data: { readonly section?: string }
}

interface WorkContext {
  readonly page: { readonly fileSlug: string }
  readonly section?: string
  readonly year?: number
  readonly medium?: string
  readonly dimensions?: RawDimensions
  readonly collections?: { readonly sections?: readonly SectionPage[] }
}

export default {
  layout: 'work.webc',
  tags: 'works',
  eleventyComputed: {
    permalink: ({ page }: WorkContext): string => `/works/${page.fileSlug}/`,

    sectionUrl: ({ section, collections }: WorkContext): string | undefined =>
      collections?.sections?.find((page) => page.data.section === section)?.url,

    sectionLabel: ({ section }: WorkContext): string | undefined =>
      section === undefined ? undefined : section[0]!.toUpperCase() + section.slice(1),

    metaLine: ({ year, medium, dimensions }: WorkContext): string =>
      formatWorkMeta(year, medium, dimensions?.height_cm, dimensions?.width_cm),

    leadAspect: ({ dimensions }: WorkContext): number =>
      dimensions?.height_cm && dimensions?.width_cm
        ? dimensions.width_cm / dimensions.height_cm
        : UNBOUNDED_ASPECT,
  },
}
