<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import CryptoJS from 'crypto-js'
import {
  clearSessionPassword,
  getSessionPassword,
  saveSessionPassword
} from '../utils/encryptSession'
import { notifyContentUpdated } from '../utils/outline'
const renderMermaid = (el?: Element | null) =>
  import('../utils/mermaid').then(m => m.renderMermaid(el))

const props = defineProps<{ data: string }>()

const password = ref('')
const decryptedHtml = ref('')
const error = ref('')
const isDecrypted = ref(false)

function decrypt(pwd: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(props.data, pwd)
    const text = bytes.toString(CryptoJS.enc.Utf8)
    return text || null
  } catch {
    return null
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function addHeadingIds(html: string): string {
  const el = document.createElement('div')
  el.innerHTML = html
  const used = new Map<string, number>()

  el.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
    const title = (h.textContent || '').trim()
    let slug = slugify(title)
    const n = used.get(slug) || 0
    used.set(slug, n + 1)
    if (n > 0) slug += `-${n}`
    h.setAttribute('id', slug)
  })

  return el.innerHTML
}

const decryptedRef = ref<HTMLElement | null>(null)

function triggerOutlineUpdate() {
  nextTick(() => {
    void notifyContentUpdated()
    renderMermaid(decryptedRef.value)
  })
}

function showContent(html: string, pwd: string) {
  decryptedHtml.value = addHeadingIds(html)
  isDecrypted.value = true
  saveSessionPassword(pwd)
  triggerOutlineUpdate()
}

function tryDecrypt() {
  error.value = ''
  const html = decrypt(password.value)
  if (!html) {
    error.value = '密码错误，请重试。'
    return
  }
  showContent(html, password.value)
}

function reEncrypt() {
  decryptedHtml.value = ''
  isDecrypted.value = false
  password.value = ''
  clearSessionPassword()
  triggerOutlineUpdate()
}

onMounted(() => {
  const savedPwd = getSessionPassword()
  if (savedPwd) {
    const html = decrypt(savedPwd)
    if (html) {
      showContent(html, savedPwd)
    }
  }
})
</script>

<template>
  <div class="encrypted-content">
    <div v-if="!isDecrypted" class="encrypt-form">
      <div class="encrypt-icon">🔒</div>
      <p class="encrypt-message">此文章已加密，请输入密码查看。</p>
      <form @submit.prevent="tryDecrypt" class="encrypt-form-inner">
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          class="encrypt-input"
          autofocus
        />
        <button type="submit" class="encrypt-btn">解密</button>
      </form>
      <p v-if="error" class="encrypt-error">{{ error }}</p>
    </div>
    <div v-else>
      <div ref="decryptedRef" class="vp-doc decrypted-body" v-html="decryptedHtml" />
      <div class="re-encrypt-bar">
        <button @click="reEncrypt" class="re-encrypt-btn">🔒 再次加密</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.encrypt-form {
  text-align: center;
  padding: 80px 20px 60px;
}
.encrypt-icon {
  font-size: 3.5em;
  margin-bottom: 20px;
}
.encrypt-message {
  color: var(--vp-c-text-2);
  margin-bottom: 28px;
  font-size: 1.15em;
}
.encrypt-form-inner {
  display: inline-flex;
  gap: 8px;
}
.encrypt-input {
  padding: 10px 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  font-size: 1em;
  width: 240px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.25s;
}
.encrypt-input:focus {
  border-color: var(--vp-c-brand-1);
}
.encrypt-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.25s;
}
.encrypt-btn:hover {
  background: var(--vp-c-brand-2);
}
.encrypt-error {
  color: var(--vp-c-danger-1);
  margin-top: 14px;
  font-size: 0.9em;
}
.decrypted-body {
  padding: 0;
}
.re-encrypt-bar {
  margin-top: 40px;
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid var(--vp-c-divider);
}
.re-encrypt-btn {
  padding: 8px 22px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.25s;
}
.re-encrypt-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>
