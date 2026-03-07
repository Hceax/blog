<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { data as posts } from '../../../posts.data.mts'
import { withBase } from 'vitepress'

const GLOBAL_KEY = 'vp-encrypt:global'
const GLOBAL_TS_KEY = 'vp-encrypt:global:ts'
const TTL_MS = 2 * 60 * 60 * 1000
const sessionValid = ref(false)

onMounted(() => {
  const pwd = localStorage.getItem(GLOBAL_KEY)
  const ts = Number(localStorage.getItem(GLOBAL_TS_KEY) || 0)
  sessionValid.value = !!(pwd && ts && Date.now() - ts <= TTL_MS)
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="blog-home">
    <div class="blog-hero">
      <h1 class="hero-title">Bob Hceax's Blog</h1>
      <p class="hero-tagline">Can do everything</p>
    </div>
    <div class="post-list">
      <article v-for="post in posts" :key="post.url" class="post-card">
        <div class="post-card-meta">
          <time>{{ formatDate(post.date) }}</time>
          <span class="category-tag">{{ post.category }}</span>
          <span v-if="post.isPrivate" class="lock-tag">🔒</span>
        </div>
        <h2>
          <a :href="withBase(post.url)">{{ post.title }}</a>
        </h2>
        <p class="post-excerpt">
          <template v-if="post.isPrivate && !sessionValid">
            此文章已加密，请输入密码查看。
          </template>
          <template v-else>
            {{ post.excerpt }}
          </template>
        </p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.blog-home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 24px;
}
.blog-hero {
  text-align: center;
  padding: 48px 0 36px;
}
.hero-title {
  font-size: 2.4em;
  font-weight: 700;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.2;
}
.hero-tagline {
  color: var(--vp-c-text-2);
  font-size: 1.1em;
  margin-top: 10px;
}
.post-list {
  margin-top: 16px;
}
.post-card {
  padding: 24px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.post-card:last-child {
  border-bottom: none;
}
.post-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85em;
  color: var(--vp-c-text-3);
  margin-bottom: 8px;
}
.category-tag {
  padding: 1px 10px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 10px;
  font-size: 0.9em;
}
.lock-tag {
  font-size: 0.9em;
}
.post-card h2 {
  margin: 0;
  font-size: 1.35em;
  font-weight: 600;
  line-height: 1.4;
}
.post-card h2 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.25s;
}
.post-card h2 a:hover {
  color: var(--vp-c-brand-1);
}
.post-excerpt {
  color: var(--vp-c-text-2);
  font-size: 0.95em;
  line-height: 1.7;
  margin-top: 8px;
}
</style>
