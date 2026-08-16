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

/**
 * Validate every work up front. `parseWork` throws on bad front matter, and a
 * throw inside a collection callback fails the Eleventy build — which is the
 * point: a work with no alt text should never reach the output directory.
 */
function toWorkEntries(api: EleventyCollectionApi): WorkEntry[] {
  const entries = api.getFilteredByGlob(WORKS_GLOB).map((item: EleventyCollectionItem) => {
    const work: Work = parseWork(item.data, item.inputPath)
    return { ...work, url: item.url, slug: item.fileSlug }
  })

  // `order` when the artist has sequenced the work by hand, `year` otherwise.
  return entries.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order
    if (a.order !== undefined) return -1
    if (b.order !== undefined) return 1
    return a.year - b.year
  })
}

export default function (eleventyConfig: EleventyConfig): void {
  // Eleventy only loads .js/.cjs/.mjs/.json data files by default. Registering
  // .ts lets _data/*.ts and *.11tydata.ts be TypeScript too — Node strips the
  // types on import, so `read: false` (hand Eleventy the path, not the source)
  // is what makes this work without a transpile step.
  eleventyConfig.addDataExtension('ts', {
    read: false,
    parser: async (filePath: string) => {
      const module = (await import(pathToFileURL(filePath).href)) as {
        default?: unknown
      }
      return module.default ?? {}
    },
  })

  // Permalinks are computed in TypeScript, so they never need to be run through a
  // template engine. Leaving this on makes Eleventy render each resolved permalink
  // as a WebC template, which invokes the CSS bundler before `page` exists and
  // crashes the build.
  eleventyConfig.setDynamicPermalinks(false)

  eleventyConfig.addPlugin(pluginWebc, {
    components: 'src/_includes/components/**/*.webc',
    // Bundle each component's <style>/<script> into the page that uses it.
    bundlePluginOptions: {
      transforms: [],
    },
  })

  // Stylesheets and fonts are served as-authored — there is no CSS build step,
  // because the CSS is the artist's to write and a build step would obscure it.
  // Everything under assets/ is copied verbatim, never treated as a template.
  // Without this, a stray .md in there (the font licence note) becomes a page.
  eleventyConfig.ignores.add('src/assets/**')

  eleventyConfig.addPassthroughCopy({ 'src/assets/css': 'assets/css' })
  eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' })
  eleventyConfig.addWatchTarget('src/assets/css/')

  eleventyConfig.addCollection('works', (api) => toWorkEntries(api))

  // Named `picture`, not `image`: a shortcode shadows page data of the same name,
  // and every work has an `image` field. `this.image` must stay the file path.
  eleventyConfig.addAsyncShortcode('picture', renderImage as never)

  // No `year`, `dimensions`, or `image` filters here, deliberately. A filter
  // shadows page data of the same name, so registering one named after a front
  // matter field makes `this.year` resolve to the function instead of the value
  // — which renders the function's source into the page rather than erroring.
  // Templates format these inline instead.
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
  // Set PATH_PREFIX to "/miriam-art/" for project-page hosting; leave as "/" when
  // a custom domain points at the site. Affects every generated URL, so every
  // internal link in a template must go through the `url` filter.
  pathPrefix: PATH_PREFIX,
}
