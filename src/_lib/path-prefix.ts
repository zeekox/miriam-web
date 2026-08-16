const raw = process.env['PATH_PREFIX'] ?? '/'

export const PATH_PREFIX = `/${raw.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/+/, '/')

export function withPrefix(url: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return url
  if (!url.startsWith('/')) return url
  return `${PATH_PREFIX}${url.replace(/^\/+/, '')}`
}
