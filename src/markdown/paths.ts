import path from 'node:path'

export interface MarkdownPathOptions {
  articlePath: string
  assetsDir?: string
  publicUrlPrefix?: string
}

export function resolveAssetsDir(options: MarkdownPathOptions): string {
  if (options.assetsDir) return path.resolve(options.assetsDir)
  const parsed = path.parse(options.articlePath)
  return path.join(parsed.dir, `${parsed.name}-assets`)
}

export function resolvePublicUrlPrefix(
  options: MarkdownPathOptions,
  assetsDir: string
): string {
  if (options.publicUrlPrefix) return trimTrailingSlash(options.publicUrlPrefix)
  return path.basename(assetsDir)
}

export function toMarkdownUrl(prefix: string, fileName: string): string {
  return `${trimTrailingSlash(prefix)}/${fileName}`.replace(/\\/g, '/')
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}
