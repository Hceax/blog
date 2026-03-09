let initPromise: Promise<void> | null = null

async function ensureInit() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'loose'
    })
  })()
  return initPromise
}

export async function renderMermaid(container?: Element | null) {
  const scope = container || document
  const nodes = scope.querySelectorAll<HTMLPreElement>('pre.mermaid')
  if (!nodes.length) return

  await ensureInit()

  const unrendered = Array.from(nodes).filter(n => !n.dataset.mermaidRendered)
  if (!unrendered.length) return

  const { default: mermaid } = await import('mermaid')

  for (const node of unrendered) {
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
    try {
      const { svg } = await mermaid.render(id, node.textContent || '')
      node.innerHTML = svg
      node.dataset.mermaidRendered = 'true'
    } catch {
      node.classList.add('mermaid-error')
    }
  }
}
