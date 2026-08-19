export interface Dimensions {
  readonly heightCm: number
  readonly widthCm: number
}

export interface WorkImage {
  readonly src: string
  readonly alt: string
  readonly group?: string
}

export type Section = 'painting' | 'sculpture' | 'video'

export const SECTIONS: readonly Section[] = ['painting', 'sculpture', 'video']

export interface VideoSource {
  readonly mp4: string
  readonly webm: string
  readonly poster: string
  readonly posterAlt: string
}

export interface Work {
  readonly title: string
  readonly section: Section
  readonly image: string
  readonly alt: string
  readonly year?: number
  readonly medium?: string
  readonly dimensions?: Dimensions
  readonly images?: readonly WorkImage[]
  readonly video?: VideoSource
  readonly order?: number
}

export interface WorkEntry extends Work {
  readonly url: string
  readonly slug: string
  readonly meta: string
}

class ContentError extends Error {
  constructor(source: string, problem: string) {
    super(`Invalid work content in ${source}: ${problem}`)
    this.name = 'ContentError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireString(
  data: Record<string, unknown>,
  key: string,
  source: string,
): string {
  const value = data[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ContentError(source, `"${key}" must be a non-empty string`)
  }
  return value
}

function requireNumber(
  data: Record<string, unknown>,
  key: string,
  source: string,
): number {
  const value = data[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ContentError(source, `"${key}" must be a finite number`)
  }
  return value
}

function optionalString(
  data: Record<string, unknown>,
  key: string,
  source: string,
): string | undefined {
  const value = data[key]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') {
    throw new ContentError(source, `"${key}" must be a string when present`)
  }
  return value
}

function optionalNumber(
  data: Record<string, unknown>,
  key: string,
  source: string,
): number | undefined {
  const value = data[key]
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ContentError(source, `"${key}" must be a finite number when present`)
  }
  return value
}

function parseDimensions(value: unknown, source: string): Dimensions {
  if (!isRecord(value)) {
    throw new ContentError(source, '"dimensions" must be a mapping of height_cm and width_cm')
  }
  const heightCm = requireNumber(value, 'height_cm', source)
  const widthCm = requireNumber(value, 'width_cm', source)
  if (heightCm <= 0 || widthCm <= 0) {
    throw new ContentError(source, '"dimensions" must be positive')
  }
  return { heightCm, widthCm }
}

function parseImages(value: unknown, source: string): readonly WorkImage[] | undefined {
  if (value === undefined || value === null) return undefined
  if (!Array.isArray(value)) {
    throw new ContentError(source, '"images" must be a list when present')
  }
  return value.map((entry, i) => {
    if (!isRecord(entry)) {
      throw new ContentError(source, `"images[${i}]" must be a mapping of src and alt`)
    }
    const group = optionalString(entry, 'group', `${source} (images[${i}])`)
    return {
      src: requireString(entry, 'src', `${source} (images[${i}])`),
      alt: requireString(entry, 'alt', `${source} (images[${i}])`),
      ...(group === undefined ? {} : { group }),
    }
  })
}

function parseSection(value: unknown, source: string): Section {
  if (typeof value !== 'string' || !SECTIONS.includes(value as Section)) {
    throw new ContentError(source, `"section" must be one of ${SECTIONS.join(', ')}`)
  }
  return value as Section
}

function parseVideo(value: unknown, source: string): VideoSource | undefined {
  if (value === undefined || value === null) return undefined
  if (!isRecord(value)) {
    throw new ContentError(source, '"video" must be a mapping when present')
  }
  return {
    mp4: requireString(value, 'mp4', source),
    webm: requireString(value, 'webm', source),
    poster: requireString(value, 'poster', source),
    posterAlt: requireString(value, 'poster_alt', source),
  }
}

function optionalDimensions(value: unknown, source: string): Dimensions | undefined {
  if (value === undefined || value === null) return undefined
  return parseDimensions(value, source)
}

export function parseWork(raw: unknown, source: string): Work {
  if (!isRecord(raw)) {
    throw new ContentError(source, 'front matter is missing or not a mapping')
  }
  return {
    title: requireString(raw, 'title', source),
    section: parseSection(raw['section'], source),
    image: requireString(raw, 'image', source),
    alt: requireString(raw, 'alt', source),
    year: optionalNumber(raw, 'year', source),
    medium: optionalString(raw, 'medium', source),
    dimensions: optionalDimensions(raw['dimensions'], source),
    images: parseImages(raw['images'], source),
    video: parseVideo(raw['video'], source),
    order: optionalNumber(raw, 'order', source),
  }
}

export function aspectRatio(dimensions: Dimensions): number {
  return dimensions.widthCm / dimensions.heightCm
}

export function formatWorkMeta(
  year: number | undefined,
  medium: string | undefined,
  heightCm: number | undefined,
  widthCm: number | undefined,
): string {
  const size =
    heightCm !== undefined && widthCm !== undefined ? `${heightCm} × ${widthCm} cm` : undefined
  return [year, medium, size].filter((part) => part !== undefined && part !== '').join(' · ')
}

export function describeWork(work: Work): string {
  return formatWorkMeta(
    work.year,
    work.medium,
    work.dimensions?.heightCm,
    work.dimensions?.widthCm,
  )
}
