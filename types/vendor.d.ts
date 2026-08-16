// Ambient declarations for the Eleventy packages, which ship JSDoc-typed
// JavaScript rather than .d.ts files.
//
// This file must have NO top-level import or export. A .d.ts with either becomes
// a module, and `declare module` inside a module means *augmentation* of an
// existing module rather than declaration of a new one — so the declarations
// below would silently stop applying. Shared interfaces live in ./eleventy.ts.

declare module '@11ty/eleventy-plugin-webc' {
  const plugin: unknown
  export default plugin
}

declare module '@11ty/eleventy-img' {
  export interface ImageMetadataEntry {
    readonly format: string
    readonly width: number
    readonly height: number
    readonly url: string
    readonly sourceType: string
    readonly srcset: string
    readonly filename: string
    readonly outputPath: string
  }

  export type ImageMetadata = Record<string, readonly ImageMetadataEntry[]>

  export interface ImageOptions {
    readonly widths?: readonly (number | 'auto' | null)[]
    readonly formats?: readonly (string | null)[]
    readonly urlPath?: string
    readonly outputDir?: string
    readonly svgShortCircuit?: boolean | 'size'
    readonly sharpOptions?: Record<string, unknown>
    readonly sharpAvifOptions?: Record<string, unknown>
    readonly sharpWebpOptions?: Record<string, unknown>
    readonly sharpJpegOptions?: Record<string, unknown>
  }

  export default function Image(
    src: string,
    options?: ImageOptions,
  ): Promise<ImageMetadata>

  export function generateHTML(
    metadata: ImageMetadata,
    attributes: Record<string, string | number | boolean | undefined>,
    options?: { readonly whitespaceMode?: 'inline' | 'block' },
  ): string
}
