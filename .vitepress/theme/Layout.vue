<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import PostMeta from './components/PostMeta.vue'

const { frontmatter } = useData()
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <PostMeta v-if="frontmatter.isPost" />
    </template>
  </DefaultTheme.Layout>
</template>
