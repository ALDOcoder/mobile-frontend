import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEYS, WS_URL } from '@/utils/constants'

export const useWebSocketStore = defineStore('websocket', () => {
  const groupWs = ref<WebSocket | null>(null)
  const privateWs = ref<WebSocket | null>(null)
  const isGroupConnected = ref(false)
  const isPrivateConnected = ref(false)

  const groupMessageHandlers = new Set<(data: any) => void>()
  const privateMessageHandlers = new Set<(data: any) => void>()

  function connectGroup(params: Record<string, string>) {
    if (groupWs.value) return
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) return

    const query = new URLSearchParams({ ...params, token }).toString()
    const url = `${WS_URL}/room?${query}`
    const ws = new WebSocket(url)

    ws.onopen = () => { isGroupConnected.value = true }
    ws.onclose = () => { isGroupConnected.value = false; groupWs.value = null }
    ws.onerror = () => { ws.close() }
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        groupMessageHandlers.forEach(h => h(data))
      } catch { /* ignore */ }
    }

    groupWs.value = ws
  }

  function connectPrivate() {
    if (privateWs.value) return
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) return

    const url = `${WS_URL}/private?token=${token}`
    const ws = new WebSocket(url)

    ws.onopen = () => { isPrivateConnected.value = true }
    ws.onclose = () => { isPrivateConnected.value = false; privateWs.value = null }
    ws.onerror = () => { ws.close() }
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        privateMessageHandlers.forEach(h => h(data))
      } catch { /* ignore */ }
    }

    privateWs.value = ws
  }

  function sendGroupMessage(data: Record<string, any>) {
    if (groupWs.value?.readyState === WebSocket.OPEN) {
      groupWs.value.send(JSON.stringify(data))
    }
  }

  function sendPrivateMessage(data: Record<string, any>) {
    if (privateWs.value?.readyState === WebSocket.OPEN) {
      privateWs.value.send(JSON.stringify(data))
    }
  }

  function addGroupHandler(handler: (data: any) => void) {
    groupMessageHandlers.add(handler)
  }

  function removeGroupHandler(handler: (data: any) => void) {
    groupMessageHandlers.delete(handler)
  }

  function addPrivateHandler(handler: (data: any) => void) {
    privateMessageHandlers.add(handler)
  }

  function removePrivateHandler(handler: (data: any) => void) {
    privateMessageHandlers.delete(handler)
  }

  function disconnectGroup() {
    groupWs.value?.close()
    groupWs.value = null
    isGroupConnected.value = false
  }

  function disconnectPrivate() {
    privateWs.value?.close()
    privateWs.value = null
    isPrivateConnected.value = false
  }

  function disconnectAll() {
    disconnectGroup()
    disconnectPrivate()
  }

  return {
    groupWs, privateWs, isGroupConnected, isPrivateConnected,
    connectGroup, connectPrivate,
    sendGroupMessage, sendPrivateMessage,
    addGroupHandler, removeGroupHandler,
    addPrivateHandler, removePrivateHandler,
    disconnectGroup, disconnectPrivate, disconnectAll
  }
})
