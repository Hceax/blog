import { contentUpdatedCallbacks } from 'vitepress/dist/client/app/utils'

export async function notifyContentUpdated(): Promise<void> {
  if (Array.isArray(contentUpdatedCallbacks) && contentUpdatedCallbacks.length) {
    contentUpdatedCallbacks.forEach(fn => {
      if (typeof fn === 'function') fn()
    })
    return
  }

  // Fallback for future VitePress internals changes.
  window.dispatchEvent(new Event('resize'))
  window.dispatchEvent(new Event('scroll'))
}
