export const GLOBAL_KEY = 'vp-encrypt:global'
export const GLOBAL_TS_KEY = 'vp-encrypt:global:ts'
export const TTL_MS = 2 * 60 * 60 * 1000

export function getSessionPassword(): string | null {
  if (typeof localStorage === 'undefined') return null
  const savedPwd = localStorage.getItem(GLOBAL_KEY)
  const savedTs = Number(localStorage.getItem(GLOBAL_TS_KEY) || 0)
  if (!savedPwd || !savedTs) return null
  return Date.now() - savedTs <= TTL_MS ? savedPwd : null
}

export function saveSessionPassword(password: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(GLOBAL_KEY, password)
  localStorage.setItem(GLOBAL_TS_KEY, String(Date.now()))
}

export function clearSessionPassword(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(GLOBAL_KEY)
  localStorage.removeItem(GLOBAL_TS_KEY)
}
