import { describe, expect, it } from 'vitest'
import { applyMarkdownImages } from '../src/markdown/writer.js'
import type { MarkdownDocument } from '../src/markdown/types.js'

const document: MarkdownDocument = {
  filePath: 'article.md',
  raw: '',
  data: {
    title: '测试文章',
    description: '这是一篇用于测试的文章。',
  },
  content: '## 第一章\n\n正文内容\n\n## 第二章\n\n更多内容\n',
}

describe('applyMarkdownImages', () => {
  it('inserts section images after matching headings', () => {
    const result = applyMarkdownImages(document, [
      {
        kind: 'section',
        title: '第一章',
        anchor: '第一章',
        prompt: 'prompt',
        alt: '第一章配图',
        filePath: 'article-assets/one.webp',
        markdownUrl: './article-assets/one.webp',
      },
    ])

    expect(result).toContain('<!-- xianchou:image title="第一章" -->')
    expect(result).toContain('![第一章配图](./article-assets/one.webp)')
  })

  it('updates cover frontmatter when cover insertion is present', () => {
    const result = applyMarkdownImages(document, [
      {
        kind: 'cover',
        title: '测试文章',
        prompt: 'prompt',
        alt: '测试文章封面图',
        filePath: 'cover.webp',
        markdownUrl: './article-assets/article-cover.webp',
        frontmatterUrl: './article-assets/article-cover.webp',
      },
    ])

    expect(result).toContain('cover: ./article-assets/article-cover.webp')
    expect(result).toContain('coverAlt: 测试文章封面图')
  })
})
