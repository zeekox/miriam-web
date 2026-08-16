import { pathToFileURL } from 'node:url'
import pluginWebc from '@11ty/eleventy-plugin-webc'
import { parseWork } from './types/content.ts'
import type { Work, WorkEntry } from './types/content.ts'
import { renderImage } from './src/_shortcodes/image.ts'
import { PATH_PREFIX } from './src/_lib/path-prefix.ts'
import type {
  EleventyConfig,
  EleventyCollectionApi,
  EleventyCollectionItem,
} from './types/eleventy.ts'

const WORKS_GLOB = 'src/content/works/*.md'

function toWorkEntries(api: EleventyCollectionApi): WorkEntry[] {
  const entries = api.getFilteredByGlob(WORKS_GLOB).map((item: EleventyCollectionItem) => {
    const work: Work = parseWork(item.data, item.inputPath)
    return { ...work, url: item.url, slug: item.fileSlug }
  })

  return entries.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order
    if (a.order !== undefined) return -1
    if (b.order !== undefined) return 1
    return a.year - b.year
  })
}

export default function (eleventyConfig: EleventyConfig): void {
  eleventyConfig.addDataExtension('ts', {
    read: false,
    parser: async (filePath: string) => {
      const module = (await import(pathToFileURL(filePath).href)) as {
        default?: unknown
      }
      return module.default ?? {}
    },
  })

  eleventyConfig.setDynamicPermalinks(false)

  eleventyConfig.addPlugin(pluginWebc, {
    components: 'src/_includes/components/**/*.webc',

    bundlePluginOptions: {
      transforms: [],
    },
  })

  eleventyConfig.ignores.add('src/assets/**')

  eleventyConfig.addPassthroughCopy({ 'src/assets/css': 'assets/css' })
  eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' })
  eleventyConfig.addWatchTarget('src/assets/css/')

  eleventyConfig.addCollection('works', (api) => toWorkEntries(api))

  eleventyConfig.addAsyncShortcode('picture', renderImage as never)
}

export const config = {
  dir: {
    input: 'src',
    includes: '_includes',
    layouts: '_layouts',
    data: '_data',
    output: '_site',
  },
  markdownTemplateEngine: 'webc',
  htmlTemplateEngine: 'webc',
  templateFormats: ['webc', 'md', 'html'],

  pathPrefix: PATH_PREFIX,
}
