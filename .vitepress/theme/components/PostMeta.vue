<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter } = useData()

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="post-meta-header">
    <time v-if="frontmatter.postDate" class="post-date">
      {{ formatDate(frontmatter.postDate) }}
    </time>
    <span v-if="frontmatter.category" class="post-category-tag">
      {{ frontmatter.category }}
    </span>
    <span v-if="frontmatter.isPrivate" class="post-private-badge">
      🔒 加密文章
    </span>
  </div>
</template>

<style scoped>
.post-meta-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.9em;
}
.post-date {
  color: var(--vp-c-text-3);
}
.post-category-tag {
  padding: 2px 12px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
}
.post-private-badge {
  padding: 2px 12px;
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 500;
}
</style>
