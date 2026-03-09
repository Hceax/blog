import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import Layout from './Layout.vue'
import BlogHome from './components/BlogHome.vue'
import ArchivePage from './components/ArchivePage.vue'
import CategoryPage from './components/CategoryPage.vue'
import EncryptedContent from './components/EncryptedContent.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('BlogHome', BlogHome)
    app.component('ArchivePage', ArchivePage)
    app.component('CategoryPage', CategoryPage)
    app.component('EncryptedContent', EncryptedContent)
  },
  setup() {
    const route = useRoute()
    const render = () => {
      nextTick(() => {
        import('./utils/mermaid').then(m => m.renderMermaid())
      })
    }
    onMounted(render)
    watch(() => route.path, render)
  }
}
