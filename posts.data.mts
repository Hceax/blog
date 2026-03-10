import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { CATEGORY_MAP, H1_RE } from './.vitepress/shared/blogMeta'

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

function gitDate(filePath: string, flag: 'first' | 'last'): string | null {
  try {
    const absPath = path.resolve(filePath)
    const postsDir = path.resolve('posts')
    const isInSubmodule = absPath.startsWith(postsDir + path.sep)
    const cwd = isInSubmodule ? postsDir : undefined
    const target = isInSubmodule ? path.relative(postsDir, absPath) : filePath

    const cmd = flag === 'first'
      ? `git log --diff-filter=A --follow --format=%aI -- "${target}"`
      : `git log -1 --format=%aI -- "${target}"`
    const out = execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
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
        return base !== 'readme.md'
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
