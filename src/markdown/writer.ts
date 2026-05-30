import matter from 'gray-matter'
import type { ImageInsertion, MarkdownDocument } from './types.js'

const markerPrefix = '<!-- xianchou:image'

export function applyMarkdownImages(
  document: MarkdownDocument,
  insertions: ImageInsertion[]
): string {
  const data = { ...document.data }
  const lines = document.content.split(/\r?\n/)

  const cover = insertions.find((item) => item.kind === 'cover')
  if (cover?.frontmatterUrl) {
    data.cover = cover.frontmatterUrl
    data.coverAlt = cover.alt
  }

  const sectionInsertions = insertions.filter((item) => item.kind === 'section')
  for (const insertion of [...sectionInsertions].reverse()) {
    const lineIndex = findInsertionLine(lines, insertion.anchor || insertion.title)
    const block = buildImageBlock(insertion)
    const existingIndex = findExistingMarker(lines, insertion.title)
    if (existingIndex >= 0) {
      lines.splice(existingIndex, 2, ...block)
    } else {
      lines.splice(lineIndex + 1, 0, '', ...block)
    }
  }

  return matter.stringify(lines.join('\n').trimStart(), data)
}

function findInsertionLine(lines: string[], anchor: string): number {
  const escaped = escapeRegExp(anchor.trim())
  const pattern = new RegExp(`^#{1,6}\\s+${escaped}\\s*$`)
  const index = lines.findIndex((line) => pattern.test(line.trim()))
  if (index >= 0) return index
  const fallback = lines.findIndex((line) => /^#{1,6}\s+/.test(line))
  return fallback >= 0 ? fallback : 0
}

function findExistingMarker(lines: string[], title: string): number {
  return lines.findIndex(
    (line) => line.startsWith(markerPrefix) && line.includes(`title="${title}"`)
  )
}

function buildImageBlock(insertion: ImageInsertion): string[] {
  return [
    `${markerPrefix} title="${insertion.title}" -->`,
    `![${insertion.alt}](${insertion.markdownUrl})`,
  ]
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
