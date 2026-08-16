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
