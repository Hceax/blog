import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export interface Post {
  title: string
  url: string
  date: string
  updated: string
  category: string
  categorySlug: string
  isPrivate: boolean
  excerpt: string
}

const CATEGORY_MAP: Record<string, string> = {
  engineering: '工程实践',
  'crash-analysis': '崩溃分析',
  'source-analysis': '源码分析'
}

const H1_RE = /^#\s+(.+)$/m

function gitDate(filePath: string, flag: 'first' | 'last'): string | null {
  try {
    const cmd = flag === 'first'
      ? `git log --diff-filter=A --follow --format=%aI -- "${filePath}"`
      : `git log -1 --format=%aI -- "${filePath}"`
    const out = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
    const line = flag === 'first' ? out.split('\n').pop() : out
    return line || null
  } catch {
    return null
  }
}

function getExcerpt(markdown: string): string {
  const text = markdown.replace(H1_RE, '').trim()
  const lines = text.split('\n')
  const result: string[] = []
  let inFence = false
  let foundParagraph = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) { inFence = !inFence; continue }
    if (inFence) continue
    if (trimmed.startsWith('#') || trimmed === '') {
      if (foundParagraph) break
      continue
    }
    if (trimmed.startsWith('|')) continue
    foundParagraph = true
    result.push(trimmed)
  }

  const raw = result.join(' ')
  return raw.length > 200 ? raw.slice(0, 200) + '…' : raw
}

declare const data: Post[]
export { data }

export default {
  watch: ['./posts/**/*.md'],
  load(watchedFiles: string[]): Post[] {
    const postsDir = path.resolve('posts')

    return watchedFiles
      .filter(f => {
        const base = path.basename(f).toLowerCase()
        return base !== 'readme.md' && base !== 'about.md'
      })
      .map(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8')

        const h1Match = content.match(H1_RE)
        const title = h1Match
          ? h1Match[1].trim()
          : path.basename(filePath, '.md').replace(/[-_]+/g, ' ')

        const created = gitDate(filePath, 'first')
        const updated = gitDate(filePath, 'last')
        let fallbackDate: string
        try {
          fallbackDate = fs.statSync(filePath).mtime.toISOString()
        } catch {
          fallbackDate = new Date().toISOString()
        }

        const rel = path.relative(postsDir, filePath).replace(/\\/g, '/')
        const parts = rel.split('/')
        const categorySlug = parts[0] || 'uncategorized'
        const category = CATEGORY_MAP[categorySlug] || categorySlug
        const isPrivate = parts.includes('private')
        const urlPath = '/posts/' + rel.replace(/\.md$/, '')
        const excerpt = getExcerpt(content)

        return {
          title,
          url: urlPath,
          date: created || fallbackDate,
          updated: updated || created || fallbackDate,
          category,
          categorySlug,
          isPrivate,
          excerpt
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}
