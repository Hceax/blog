import fs from 'fs'
import path from 'path'
import CryptoJS from 'crypto-js'
import { createMarkdownRenderer } from 'vitepress'
import { H1_RE } from '../shared/blogMeta'
let password: string | null = null
let mdPromise: Promise<any> | null = null

function getPassword(root: string): string {
  if (password !== null) return password
  try {
    const configPath = path.resolve(root, 'posts/_config.json')
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    password = config.password || ''
  } catch {
    password = ''
  }
  return password!
}

function isPrivatePost(id: string): boolean {
  const n = id.replace(/\\/g, '/')
  return n.includes('/posts/') && n.includes('/private/') && n.endsWith('.md')
}

export function encryptPlugin() {
  let root = ''

  const getRenderer = () => {
    if (!mdPromise) {
      mdPromise = createMarkdownRenderer(
        root || process.cwd(),
        {
          lineNumbers: true
        },
        '/blog/'
      )
    }
    return mdPromise
  }

  return {
    name: 'vitepress-encrypt',
    enforce: 'pre' as const,
    configResolved(config: any) {
      root = config.root || process.cwd()
    },
    async transform(code: string, id: string) {
      if (!isPrivatePost(id)) return

      const pwd = getPassword(root)
      if (!pwd) return

      const h1Match = code.match(H1_RE)
      const title = h1Match
        ? h1Match[1].trim()
        : path.basename(id, '.md').replace(/[-_]+/g, ' ')

      const md = await getRenderer()
      const rendered = md.render(code)
      const html = typeof rendered === 'string' ? rendered : rendered.html

      const encrypted = CryptoJS.AES.encrypt(html, pwd).toString()

      return {
        code: [
          '---',
          `title: "${title.replace(/"/g, '\\"')}"`,
          '---',
          '',
          '<script setup>',
          `const encryptedData = ${JSON.stringify(encrypted)}`,
          '</script>',
          '',
          '<EncryptedContent :data="encryptedData" />',
          ''
        ].join('\n'),
        map: null
      }
    }
  }
}
