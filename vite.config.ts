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
    /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
    host: true,
    /** 是否自动打开浏览器 */
    open: true,
    /** 端口号 */
    port: 5173,
    /** 端口被占用时，是否直接退出 */
    strictPort: false,
    /** 接口代理 */
    proxy: {
      '/api': {
        //target: 'http://localhost:8438', // 本地服务器地址
        target: 'http://47.105.75.189:8438',  // 测试服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const ip = req.socket.remoteAddress || ''
            proxyReq.setHeader('X-Real-IP', ip)
            proxyReq.setHeader('X-Forwarded-For', ip)
          })
        }
      },
      '/chat': {
        //target: 'http://localhost:8438',
        target: 'http://47.105.75.189:8438',  // 测试服务器地址
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const ip = req.socket.remoteAddress || ''
            proxyReq.setHeader('X-Real-IP', ip)
            proxyReq.setHeader('X-Forwarded-For', ip)
          })
        }
      },
      '/webrtc': {
        //target: 'http://localhost:8438',
        target: 'http://47.105.75.189:8438',  // 测试服务器地址
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const ip = req.socket.remoteAddress || ''
            proxyReq.setHeader('X-Real-IP', ip)
            proxyReq.setHeader('X-Forwarded-For', ip)
          })
        }
      }
    }
  }
})
