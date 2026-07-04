import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        //target: 'http://localhost:8438', // 本地服务器地址
        target: 'http//58.100.91.134:8438',  // 测试服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/chat': {
        target: 'http://localhost:8438',
        changeOrigin: true,
        ws: true
      },
      '/webrtc': {
        target: 'http://localhost:8438',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
