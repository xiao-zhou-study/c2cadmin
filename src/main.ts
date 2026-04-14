import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'
import './styles/index.scss'

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')

// 页面加载时自动刷新token
window.addEventListener('load', async () => {
  const userStore = useUserStore()
  // 如果用户已登录，自动刷新token
  if (userStore.isLoggedIn) {
    try {
      await userStore.refreshTokenAction()
    } catch (error) {
      console.error('自动刷新token失败:', error)
    }
  }
})
