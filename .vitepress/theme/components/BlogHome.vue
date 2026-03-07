<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { data as posts } from '../../../posts.data.mts'
import { withBase } from 'vitepress'
import { formatDateCN } from '../utils/date'
import { getSessionPassword } from '../utils/encryptSession'

const sessionValid = ref(false)

onMounted(() => {
  sessionValid.value = !!getSessionPassword()
})

function formatDate(dateStr: string): string {
  return formatDateCN(dateStr)
}

const categoryStats = computed(() => {
  const map = new Map<string, { name: string; count: number }>()
  for (const post of posts) {
    const key = post.categorySlug
    const item = map.get(key)
    if (item) item.count += 1
    else map.set(key, { name: post.category, count: 1 })
  }
  return Array.from(map.entries())
    .map(([slug, item]) => ({ slug, ...item }))
    .sort((a, b) => b.count - a.count)
})

const archiveStats = computed(() => {
  const map = new Map<string, number>()
  for (const post of posts) {
    const year = String(new Date(post.date).getFullYear())
    map.set(year, (map.get(year) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => Number(b.year) - Number(a.year))
})

const recentPosts = computed(() => posts.slice(0, 5))
</script>

<template>
  <div class="blog-home">
    <div class="home-grid">
      <main class="main-column">
        <section class="home-banner">
          <p class="banner-kicker">Bob Hceax's Blog</p>
          <h1 class="banner-title">生活与技术并行的实验室</h1>
          <p class="banner-subtitle">
            记录技术实践、踩坑复盘和跨领域探索，保持好奇，持续迭代。
          </p>
        </section>

        <article v-for="post in posts" :key="post.url" class="post-card">
          <h2 class="post-title">
            <a :href="withBase(post.url)">
              {{ post.title }}
            </a>
          </h2>
          <div class="post-meta">
            <time>{{ formatDate(post.date) }}</time>
            <span class="dot">•</span>
            <span>{{ post.category }}</span>
            <span v-if="post.isPrivate" class="post-lock">🔒</span>
          </div>
          <p class="post-excerpt">
            <template v-if="post.isPrivate && !sessionValid">
              此文章已加密，请输入密码查看。
            </template>
            <template v-else>
              {{ post.excerpt }}
            </template>
          </p>
          <a class="read-more" :href="withBase(post.url)">阅读全文</a>
        </article>
      </main>

      <aside class="side-column">
        <section class="profile-card">
          <div class="avatar-wrap">
            <div class="avatar-glow" />
            <img class="avatar" :src="withBase('/images/avatar.jpg')" alt="Bob Hceax avatar" />
          </div>
          <h1>Bob Hceax</h1>
          <p>Can do everything</p>
          <div class="site-counts">
            <span>{{ posts.length }} Posts</span>
            <span>{{ categoryStats.length }} Categories</span>
          </div>
        </section>

        <section class="widget">
          <h3>Categories</h3>
          <ul class="widget-list">
            <li v-for="cat in categoryStats" :key="cat.slug">
              <a :href="withBase('/categories')">{{ cat.name }}</a>
              <span class="badge">{{ cat.count }}</span>
            </li>
          </ul>
        </section>

        <section class="widget">
          <h3>Archives</h3>
          <ul class="widget-list">
            <li v-for="archive in archiveStats" :key="archive.year">
              <a :href="withBase('/archives')">{{ archive.year }}</a>
              <span class="badge">{{ archive.count }}</span>
            </li>
          </ul>
        </section>

        <section class="widget">
          <h3>Recent Posts</h3>
          <ul class="recent-list">
            <li v-for="post in recentPosts" :key="post.url">
              <a :href="withBase(post.url)" :title="post.title">{{ post.title }}</a>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.blog-home {
  max-width: var(--blog-home-max-width, 1180px);
  margin: 0 auto;
  padding: 34px 20px 34px;
}

.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--blog-aside-width, 250px);
  gap: var(--blog-column-gap, 40px);
  align-items: start;
}

.main-column {
  min-width: 0;
}

.home-banner {
  position: relative;
  border-radius: 26px;
  padding: 28px 30px 24px;
  margin-bottom: 22px;
  background:
    radial-gradient(circle at 12% 22%, color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent), transparent 42%),
    radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--vp-c-brand-3) 15%, transparent), transparent 38%),
    var(--vp-c-bg-soft);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 20%, var(--vp-c-divider));
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.06);
}

.banner-kicker {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

.banner-title {
  margin: 8px 0 0;
  font-size: 2rem;
  line-height: 1.2;
  color: var(--vp-c-text-1);
  letter-spacing: 0.01em;
  font-family: "Palatino Linotype", "Noto Serif SC", "Source Han Serif SC", serif;
}

.banner-subtitle {
  margin: 12px 0 0;
  font-size: 0.97rem;
  line-height: 1.85;
  color: var(--vp-c-text-2);
  max-width: 640px;
}

.post-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 22px;
  padding: 25px 28px;
  margin-bottom: 20px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 30%, var(--vp-c-divider));
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.1);
}

.post-title {
  margin: 0;
  font-size: 1.62rem;
  line-height: 1.3;
  letter-spacing: 0.01em;
  font-family: "Palatino Linotype", "Noto Serif SC", "Source Han Serif SC", serif;
}

.post-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.post-title a:hover {
  color: var(--vp-c-brand-1);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.84rem;
  color: var(--vp-c-text-3);
}

.dot {
  opacity: 0.7;
}

.post-lock {
  margin-left: 2px;
}

.post-excerpt {
  margin: 16px 0 18px;
  color: var(--vp-c-text-2);
  line-height: 1.9;
  font-size: 0.98rem;
}

.read-more {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
}

.read-more:hover {
  text-decoration: underline;
}

.side-column {
  position: sticky;
  top: calc(var(--vp-nav-height) + 20px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card,
.widget {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.profile-card {
  text-align: center;
  overflow: hidden;
  padding: 22px 18px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent) 0%,
      var(--vp-c-bg-soft) 38%
    );
}

.avatar-wrap {
  position: relative;
  width: 104px;
  height: 104px;
  margin: 4px auto 14px;
  animation: floatUpDown 3s ease-in-out infinite;
}

.avatar-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent), transparent 68%);
  filter: blur(10px);
  animation: glowPulse 2.8s ease-in-out infinite;
}

.avatar {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
}

.profile-card h1 {
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: 0.02em;
  font-family: "Palatino Linotype", "Noto Serif SC", "Source Han Serif SC", serif;
  color: var(--vp-c-text-1);
}

.profile-card p {
  margin: 8px 0 14px;
  color: var(--vp-c-text-2);
  font-size: 0.94rem;
}

.site-counts {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  flex-wrap: wrap;
}

.widget h3 {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--vp-c-text-1);
}

.widget-list,
.recent-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.widget-list li,
.recent-list li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 0;
  font-size: 0.91rem;
  min-width: 0;
}

.widget-list a,
.recent-list a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  min-width: 0;
}

.widget-list a:hover,
.recent-list a:hover {
  color: var(--vp-c-brand-1);
}

.recent-list a {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  overflow: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.badge {
  min-width: 1.5em;
  text-align: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 16%, var(--vp-c-bg));
  color: var(--vp-c-brand-1);
  padding: 0 0.45em;
  font-size: 0.78rem;
  line-height: 1.5;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.08);
  }
}

@keyframes floatUpDown {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (max-width: 1024px) {
  .home-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .home-banner {
    padding: 22px 20px 20px;
  }

  .banner-title {
    font-size: 1.65rem;
  }

  .side-column {
    position: static;
  }
}
</style>
