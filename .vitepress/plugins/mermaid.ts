import type MarkdownIt from 'markdown-it'

/**
 * markdown-it plugin: render ```mermaid``` fenced blocks as
 * <pre class="mermaid">…</pre> so the mermaid client library
 * can pick them up at runtime. Works with both normal pages
 * and encrypted content (which is injected via v-html).
 */
export function mermaidMarkdownPlugin(md: MarkdownIt) {
  const fallback = md.renderer.rules.fence!.bind(md.renderer.rules)

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.info.trim() === 'mermaid') {
      const escaped = md.utils.escapeHtml(token.content.trim())
      return `<pre class="mermaid">${escaped}</pre>\n`
    }
    return fallback(tokens, idx, options, env, self)
  }
}
