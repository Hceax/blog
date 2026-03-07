<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../../posts.data.mts'
import { withBase } from 'vitepress'

interface YearGroup {
  year: string
  posts: typeof posts
}

const grouped = computed<YearGroup[]>(() => {
  const map = new Map<string, typeof posts>()
  for (const post of posts) {
    const year = new Date(post.date).getFullYear().toString()
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(post)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, items]) => ({ year, posts: items }))
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div class="archive-page">
    <div class="archive-header">
      <h1>归档</h1>
      <p class="archive-count">共 {{ posts.length }} 篇文章</p>
    </div>
    <div v-for="group in grouped" :key="group.year" class="year-group">
      <h2 class="year-title">{{ group.year }}</h2>
      <ul class="archive-list">
        <li v-for="post in group.posts" :key="post.url" class="archive-item">
          <time>{{ formatDate(post.date) }}</time>
          <a :href="withBase(post.url)">
            {{ post.title }}
            <span v-if="post.isPrivate" class="lock-icon">🔒</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.archive-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px 24px;
}
.archive-header {
  margin-bottom: 32px;
}
.archive-header h1 {
  font-size: 2em;
  font-weight: 700;
  margin: 0;
}
.archive-count {
  color: var(--vp-c-text-3);
  margin-top: 8px;
  font-size: 0.95em;
}
.year-group {
  margin-bottom: 36px;
}
.year-title {
  font-size: 1.4em;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--vp-c-brand-soft);
}
.archive-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.archive-item {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 8px 0;
}
.archive-item time {
  flex-shrink: 0;
  font-size: 0.9em;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  min-width: 50px;
}
.archive-item a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 1em;
  transition: color 0.25s;
}
.archive-item a:hover {
  color: var(--vp-c-brand-1);
}
.lock-icon {
  font-size: 0.85em;
  margin-left: 4px;
}
</style>
