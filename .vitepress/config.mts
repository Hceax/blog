import { defineConfig } from 'vitepress'
import { encryptPlugin } from './plugins/encrypt'
import { CATEGORY_MAP } from './shared/blogMeta'

export default defineConfig({
  title: "Bob Hceax's Blog",
  description: 'Can do everything',
  base: '/blog/',
  lang: 'zh-Hans',
  cleanUrls: true,

  srcExclude: ['**/README.md', '**/node_modules/**'],

  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '归档', link: '/archives' },
      { text: '分类', link: '/categories' },
      { text: '关于', link: '/about' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Hceax' }
    ],

    outline: {
      level: [2, 3],
      label: '目录'
    },

    footer: {
      message: 'Hosted by GitHub Pages',
      copyright: '© 2026 Bob Hceax'
    },

    search: {
      provider: 'local'
    },

    lastUpdated: {
      text: '最后更新于'
    }
  },

  async transformPageData(pageData) {
    const rel = pageData.relativePath
    if (!rel.startsWith('posts/')) return

    pageData.frontmatter.isPost = true
    pageData.frontmatter.isPrivate = rel.includes('/private/')

    const parts = rel.replace('posts/', '').split('/')
    const catSlug = parts[0]
    pageData.frontmatter.category = CATEGORY_MAP[catSlug] || catSlug

    try {
      const { execSync } = await import('child_process')
      const fp = pageData.filePath
      const getDate = (flag: string) => {
        const cmd = flag === 'first'
          ? `git log --diff-filter=A --follow --format=%aI -- "${fp}"`
          : `git log -1 --format=%aI -- "${fp}"`
        const out = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
        return flag === 'first' ? out.split('\n').pop() || '' : out
      }
      const created = getDate('first')
      if (created) pageData.frontmatter.postDate = created
    } catch {}
  },

  vite: {
    plugins: [encryptPlugin()]
  },

  markdown: {
    lineNumbers: true
  }
})
