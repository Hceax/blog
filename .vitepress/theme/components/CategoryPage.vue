<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../../posts.data.mts'
import { withBase } from 'vitepress'

interface CategoryGroup {
  name: string
  slug: string
  posts: typeof posts
}

const grouped = computed<CategoryGroup[]>(() => {
  const map = new Map<string, { name: string; slug: string; items: typeof posts }>()
  for (const post of posts) {
    const key = post.categorySlug
    if (!map.has(key)) {
      map.set(key, { name: post.category, slug: key, items: [] })
    }
    map.get(key)!.items.push(post)
  }
  return Array.from(map.values())
    .sort((a, b) => b.items.length - a.items.length)
    .map(g => ({ name: g.name, slug: g.slug, posts: g.items }))
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>

<template>
  <div class="category-page">
    <div class="category-header">
      <h1>分类</h1>
      <p class="category-count">共 {{ grouped.length }} 个分类</p>
    </div>
    <div v-for="cat in grouped" :key="cat.slug" class="cat-group">
      <h2 class="cat-title">
        {{ cat.name }}
        <span class="cat-badge">{{ cat.posts.length }}</span>
      </h2>
      <ul class="cat-list">
        <li v-for="post in cat.posts" :key="post.url" class="cat-item">
          <a :href="withBase(post.url)">
            {{ post.title }}
            <span v-if="post.isPrivate" class="lock-icon">🔒</span>
          </a>
          <time>{{ formatDate(post.date) }}</time>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.category-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px 24px;
}
.category-header {
  margin-bottom: 32px;
}
.category-header h1 {
  font-size: 2em;
  font-weight: 700;
  margin: 0;
}
.category-count {
  color: var(--vp-c-text-3);
  margin-top: 8px;
  font-size: 0.95em;
}
.cat-group {
  margin-bottom: 36px;
}
.cat-title {
  font-size: 1.3em;
  font-weight: 600;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.cat-badge {
  font-size: 0.7em;
  font-weight: 500;
  padding: 2px 10px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 10px;
}
.cat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.cat-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cat-item:last-child {
  border-bottom: none;
}
.cat-item a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.25s;
}
.cat-item a:hover {
  color: var(--vp-c-brand-1);
}
.cat-item time {
  flex-shrink: 0;
  font-size: 0.85em;
  color: var(--vp-c-text-3);
  margin-left: 16px;
}
.lock-icon {
  font-size: 0.85em;
  margin-left: 4px;
}
</style>
