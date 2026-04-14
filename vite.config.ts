import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { CodeInspectorPlugin } from 'code-inspector-plugin'

export default defineConfig({
  plugins: [
    vue(),
    CodeInspectorPlugin({
      bundler: 'vite',
      editor: 'code'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 4000,
    open: true,
    proxy: {
      // 开发环境代理配置 - 所有 /api 请求转发到本地 Gateway
      // Gateway 会根据路径前缀（/as, /us, /is 等）路由到对应的微服务
      '/api': {
        target: 'http://127.0.0.1:10010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        ws: true // 启用WebSocket代理
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})
