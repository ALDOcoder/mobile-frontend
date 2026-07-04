import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { decodeJwt, type JwtPayload } from '@/utils/jwt'
import { STORAGE_KEYS } from '@/utils/constants'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'

export interface UserInfo {
  id: string
  username: string
  phone: string
  email: string
  sex: string
  role: string
  avatar: string
  createdTime: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '')
  const refreshToken = ref(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value)
  const userId = computed(() => {
    if (!accessToken.value) return null
    const payload = decodeJwt(accessToken.value)
    return payload?.userId ?? null
  })
  const username = computed(() => {
    if (!accessToken.value) return null
    const payload = decodeJwt(accessToken.value)
    return payload?.username ?? null
  })
  const role = computed(() => {
    if (!accessToken.value) return null
    const payload = decodeJwt(accessToken.value)
    return payload?.role ?? null
  })

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
  }

  function clearAuth() {
    accessToken.value = ''
    refreshToken.value = ''
    userInfo.value = null
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  async function login(username: string, password: string, code?: string, uuid?: string) {
    const res = await authApi.login({ username, password, code, uuid })
    setTokens(res.data.accessToken, res.data.refreshToken)
    await fetchUserInfo()
  }

  async function logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    clearAuth()
  }

  async function fetchUserInfo() {
    const res = await userApi.getInfo()
    userInfo.value = res.data
  }

  return {
    accessToken, refreshToken, userInfo,
    isLoggedIn, userId, username, role,
    setTokens, clearAuth, login, logout, fetchUserInfo
  }
})
