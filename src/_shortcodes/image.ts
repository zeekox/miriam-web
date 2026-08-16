import path from 'node:path'
import Image, { generateHTML } from '@11ty/eleventy-img'
import type { ImageMetadata } from '@11ty/eleventy-img'
import { withPrefix } from '../_lib/path-prefix.ts'

/**
 * Build-time image pipeline for photographs of works.
 *
 * Two source cases, one pipeline:
 *  - SVG sources (the placeholder works shipped with the scaffold) emit the vector
 *    itself first, so nothing in the scaffold ships as authored raster.
 *  - Photographs (what replaces them) have no vector form, so they emit AVIF and
 *    WebP with a JPEG fallback.
 *
 * `svgShortCircuit: false` means an SVG source still gets raster derivatives
 * generated behind it, so the <picture> degrades even where SVG is unavailable.
 */

const WIDTHS = [480, 960, 1440, 1920] as const
const FORMATS = ['svg', 'avif', 'webp', 'jpeg'] as const

export interface ImageAttributes {
  readonly alt: string
  readonly sizes?: string
  readonly className?: string
  /** The first work on a page should not be lazy — it is the LCP element. */
  readonly eager?: boolean
}

export async function renderImage(
  src: string,
  { alt, sizes = '100vw', className, eager = false }: ImageAttributes,
): Promise<string> {
  // `alt` is enforced by the content type, but the shortcode is a second door
  // into this function — an empty alt here would silently ship an unlabelled work.
  if (typeof alt !== 'string' || alt.trim() === '') {
    throw new Error(`Image "${src}" was rendered without alt text.`)
  }

  const metadata: ImageMetadata = await Image(src, {
    widths: [...WIDTHS],
    formats: [...FORMATS],
    // eleventy-img writes URLs directly into the markup, bypassing the `url`
    // filter, so the path prefix has to be applied here.
    urlPath: withPrefix('/assets/images/'),
    outputDir: path.join('_site', 'assets', 'images'),
    svgShortCircuit: false,
    sharpOptions: { failOn: 'error' },
    // 4:4:4 keeps chroma at full resolution. Default subsampling smears the
    // colour boundaries that a photograph of a painting exists to show.
    // (The embedded ICC profile is preserved by eleventy-img itself.)
    sharpJpegOptions: { quality: 82, progressive: true, chromaSubsampling: '4:4:4' },
    sharpWebpOptions: { quality: 82 },
    sharpAvifOptions: { quality: 70 },
  })

  // Built conditionally: passing `undefined` renders a literal
  // fetchpriority="undefined" into the markup rather than omitting the attribute.
  const attributes: Record<string, string> = {
    alt,
    sizes,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
  }
  if (className !== undefined) attributes['class'] = className
  if (eager) attributes['fetchpriority'] = 'high'

  return generateHTML(metadata, attributes, { whitespaceMode: 'inline' })
}
