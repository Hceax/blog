import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import BlogHome from './components/BlogHome.vue'
import ArchivePage from './components/ArchivePage.vue'
import CategoryPage from './components/CategoryPage.vue'
import EncryptedContent from './components/EncryptedContent.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('BlogHome', BlogHome)
    app.component('ArchivePage', ArchivePage)
    app.component('CategoryPage', CategoryPage)
    app.component('EncryptedContent', EncryptedContent)
  }
}
