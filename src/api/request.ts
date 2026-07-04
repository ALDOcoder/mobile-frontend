import axios from 'axios'
import { showToast } from 'vant'
import { STORAGE_KEYS, API_BASE } from '@/utils/constants'

const request = axios.create({
  baseURL: API_BASE,
  timeout: 15000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  if (refreshToken) {
    config.headers['Refresh-Token'] = refreshToken
  }
  return config
})

request.interceptors.response.use(
  response => {
    // Token refresh from headers
    const newToken = response.headers['x-auth-token']
    if (newToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken)
    }
    const newRefresh = response.headers['x-refresh-token']
    if (newRefresh) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefresh)
    }

    // 解包后端统一 Result<T> 包装
    // 后端返回格式：{ code: 200, data: { ... }, message: "...", total: ... }
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code !== 200) {
        showToast(body.message || '请求失败')
        return Promise.reject(new Error(body.message || '请求失败'))
      }
      // 用内层 data 替换外层 data，使所有 res.data.xxx 直接取到 payload
      response.data = body.data
    }
    return response
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      const currentPath = window.location.hash
      if (!currentPath.includes('#/login') && !currentPath.includes('#/register') && !currentPath.includes('#/forgot')) {
        showToast('登录已过期，请重新登录')
        setTimeout(() => {
          window.location.hash = '#/login'
        }, 1000)
      }
    } else {
      const msg = error.response?.data?.message || error.response?.data?.msg || '请求失败'
      showToast(msg)
    }
    return Promise.reject(error)
  }
)

export default request
