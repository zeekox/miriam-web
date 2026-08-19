import { pathToFileURL } from 'node:url'
import pluginWebc from '@11ty/eleventy-plugin-webc'
import { parseWork, describeWork } from './types/content.ts'
import type { Work, WorkEntry } from './types/content.ts'
import { renderImage } from './src/_shortcodes/image.ts'
import { PATH_PREFIX, assetUrl } from './src/_lib/path-prefix.ts'
import type {
  EleventyConfig,
  EleventyCollectionApi,
  EleventyCollectionItem,
} from './types/eleventy.ts'

const WORKS_GLOB = 'src/content/works/*.md'

function toWorkEntries(api: EleventyCollectionApi): WorkEntry[] {
  const entries = api.getFilteredByGlob(WORKS_GLOB).map((item: EleventyCollectionItem) => {
    const work: Work = parseWork(item.data, item.inputPath)
    return { ...work, url: item.url, slug: item.fileSlug, meta: describeWork(work) }
  })

  const rank = (value: number | undefined): number => value ?? Number.POSITIVE_INFINITY

  return entries.sort(
    (a, b) =>
      rank(a.order) - rank(b.order) ||
      rank(a.year) - rank(b.year) ||
      a.title.localeCompare(b.title),
  )
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
  eleventyConfig.addPassthroughCopy({ 'src/assets/video': 'assets/video' })
  eleventyConfig.addPassthroughCopy({ 'src/assets/js': 'assets/js' })
  eleventyConfig.addPassthroughCopy({ 'src/assets/favicon.svg': 'assets/favicon.svg' })
  eleventyConfig.addPassthroughCopy({
    'src/assets/apple-touch-icon.png': 'assets/apple-touch-icon.png',
  })
  eleventyConfig.addWatchTarget('src/assets/css/')

  eleventyConfig.addCollection('works', (api) => toWorkEntries(api))

  eleventyConfig.addAsyncShortcode('picture', renderImage as never)

  eleventyConfig.addFilter('assetUrl', ((repoPath: string) => assetUrl(repoPath)) as never)
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
