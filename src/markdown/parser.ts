import { readFile } from 'node:fs/promises'
import matter from 'gray-matter'
import type { Heading, MarkdownDocument } from './types.js'

const headingPattern = /^(#{1,6})\s+(.+?)\s*$/

export async function readMarkdownDocument(
  filePath: string
): Promise<MarkdownDocument> {
  const raw = await readFile(filePath, 'utf8')
  const parsed = matter(raw)
  return {
    filePath,
    raw,
    data: parsed.data,
    content: parsed.content,
  }
}

export function getTitle(document: MarkdownDocument): string {
  const title = document.data.title
  if (typeof title === 'string' && title.trim()) return title.trim()
  const h1 = extractHeadings(document.content).find((heading) => heading.depth === 1)
  return h1?.text || ''
}

export function getDescription(document: MarkdownDocument): string {
  const description = document.data.description
  if (typeof description === 'string') return description
  const summary = document.data.summary
  if (Array.isArray(summary)) return summary.filter(Boolean).join(' ')
  return ''
}

export function getStringArrayField(
  document: MarkdownDocument,
  field: string
): string[] {
  const value = document.data[field]
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

export function extractHeadings(content: string): Heading[] {
  return content.split(/\r?\n/).flatMap((line, lineIndex) => {
    const match = line.match(headingPattern)
    if (!match) return []
    return [
      {
        depth: match[1].length,
        text: match[2].replace(/[#*_`]/g, '').trim(),
        lineIndex,
      },
    ]
  })
}

export function slugFromDocument(document: MarkdownDocument): string {
  const slug = document.data.slug
  if (typeof slug === 'string' && slug.trim()) return slug.trim()
  const title = getTitle(document)
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'article'
}
