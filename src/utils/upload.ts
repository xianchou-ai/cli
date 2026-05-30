import { access } from 'node:fs/promises'
import type { XianchouClient } from '../api/client.js'

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

/**
 * If value is a URL, return it as-is.
 * If value is a local file path that exists, upload it and return the resulting URL.
 * Otherwise throw.
 */
export async function resolveFileOrUrl(
  client: XianchouClient,
  value: string
): Promise<string> {
  if (looksLikeUrl(value)) {
    return value
  }

  await access(value)
  const result = await client.uploadFile(value)
  return result.url
}

/**
 * Resolve an array of values, uploading local files as needed.
 */
export async function resolveFilesOrUrls(
  client: XianchouClient,
  values: string[]
): Promise<string[]> {
  return Promise.all(values.map((v) => resolveFileOrUrl(client, v)))
}
