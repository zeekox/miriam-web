import path from 'node:path'
import Image, { generateHTML } from '@11ty/eleventy-img'
import type { ImageMetadata } from '@11ty/eleventy-img'
import { withPrefix } from '../_lib/path-prefix.ts'

const WIDTHS = [480, 960, 1440, 1920] as const
const FORMATS = ['svg', 'avif', 'webp', 'jpeg'] as const

export interface ImageAttributes {
  readonly alt: string
  readonly sizes?: string
  readonly className?: string
  readonly eager?: boolean
}

export async function renderImage(
  src: string,
  { alt, sizes = '100vw', className, eager = false }: ImageAttributes,
): Promise<string> {
  if (typeof alt !== 'string' || alt.trim() === '') {
    throw new Error(`Image "${src}" was rendered without alt text.`)
  }

  const metadata: ImageMetadata = await Image(src, {
    widths: [...WIDTHS],
    formats: [...FORMATS],

    urlPath: withPrefix('/assets/images/'),
    outputDir: path.join('_site', 'assets', 'images'),
    svgShortCircuit: false,
    sharpOptions: { failOn: 'error' },

    sharpJpegOptions: { quality: 82, progressive: true, chromaSubsampling: '4:4:4' },
    sharpWebpOptions: { quality: 82 },
    sharpAvifOptions: { quality: 70 },
  })

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
