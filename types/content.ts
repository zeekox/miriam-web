/**
 * The content contract.
 *
 * Front matter is untyped YAML at rest, so these types are only a promise until
 * something checks them. `assertWork` is that check: it runs at build time and
 * throws, which fails the Eleventy build rather than shipping a broken figure.
 */

/** Physical size of the work, in centimetres. Structured, not a display string. */
export interface Dimensions {
  readonly heightCm: number
  readonly widthCm: number
}

export interface Work {
  readonly title: string
  readonly year: number
  /** e.g. "oil on linen" */
  readonly medium: string
  readonly dimensions: Dimensions
  /** Path to the source photograph, relative to the repo root. */
  readonly image: string
  /**
   * Required, deliberately not optional. A gallery of paintings without alt text
   * is a gallery that does not exist for some visitors.
   */
  readonly alt: string
  /** Optional grouping key. */
  readonly series?: string
  /** Optional manual sequencing; falls back to `year`. */
  readonly order?: number
}

/** A `Work` plus the things Eleventy knows about the page it came from. */
export interface WorkEntry extends Work {
  readonly url: string
  readonly slug: string
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

/**
 * Narrow raw front matter to a `Work`, or throw.
 *
 * `source` is the file path, so a failure names the file the author has to fix
 * instead of just reporting that something, somewhere, is wrong.
 */
export function parseWork(raw: unknown, source: string): Work {
  if (!isRecord(raw)) {
    throw new ContentError(source, 'front matter is missing or not a mapping')
  }
  return {
    title: requireString(raw, 'title', source),
    year: requireNumber(raw, 'year', source),
    medium: requireString(raw, 'medium', source),
    dimensions: parseDimensions(raw['dimensions'], source),
    image: requireString(raw, 'image', source),
    alt: requireString(raw, 'alt', source),
    series: optionalString(raw, 'series', source),
    order: optionalNumber(raw, 'order', source),
  }
}

/** Aspect ratio (width / height) from the physical dimensions. */
export function aspectRatio(dimensions: Dimensions): number {
  return dimensions.widthCm / dimensions.heightCm
}
