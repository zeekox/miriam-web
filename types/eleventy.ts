/**
 * The subset of Eleventy's config API this project calls.
 *
 * Intentionally narrow — modelling every overload of addCollection/addShortcode
 * would be noise. Interfaces only, so `import type` erases this file at runtime.
 */

export interface EleventyCollectionItem {
  readonly url: string
  readonly inputPath: string
  readonly fileSlug: string
  readonly data: Record<string, unknown>
}

export interface EleventyCollectionApi {
  getFilteredByGlob(glob: string): EleventyCollectionItem[]
}

export interface EleventyConfig {
  /** Glob patterns Eleventy will not treat as templates. */
  readonly ignores: Set<string>
  addPlugin(plugin: unknown, options?: Record<string, unknown>): void
  addPassthroughCopy(
    paths: string | Record<string, string>,
    options?: Record<string, unknown>,
  ): void
  addCollection(
    name: string,
    callback: (api: EleventyCollectionApi) => unknown,
  ): void
  addAsyncShortcode(
    name: string,
    callback: (...args: never[]) => Promise<string>,
  ): void
  addFilter(name: string, callback: (...args: never[]) => unknown): void
  addWatchTarget(target: string): void
  setDynamicPermalinks(enabled: boolean): void
  addDataExtension(
    extension: string,
    options: {
      readonly read: boolean
      readonly parser: (input: string) => Promise<unknown> | unknown
    },
  ): void
}
