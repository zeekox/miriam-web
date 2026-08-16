/**
 * The site's path prefix, shared by the Eleventy config and the image pipeline.
 *
 * GitHub Pages serves project sites from `/<repo>/`, so every absolute URL needs
 * that segment in front of it. Eleventy's own `url` filter handles this for
 * template links, but images are emitted by eleventy-img outside the template
 * pipeline — so that one path has to be prefixed by hand, from the same source of
 * truth, or local builds pass while the deployed site 404s.
 */

const raw = process.env['PATH_PREFIX'] ?? '/'

/** Normalised to always start and end with exactly one slash. */
export const PATH_PREFIX = `/${raw.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/+/, '/')

/** Prefix an absolute, site-rooted path. Leaves external URLs untouched. */
export function withPrefix(url: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return url
  if (!url.startsWith('/')) return url
  return `${PATH_PREFIX}${url.replace(/^\/+/, '')}`
}
