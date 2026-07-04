<template>
  <div class="chat-room">
    <van-nav-bar
      :title="chatTitle"
      left-text="返回"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    />

    <!-- 消息列表 -->
    <div class="message-list" ref="listRef">
      <div class="load-more" v-if="hasMore" @click="loadHistory">
        <van-loading v-if="historyLoading" size="16" />
        <span v-else>加载更多</span>
      </div>

      <MessageBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :show-name="chatType === 'group'"
        @preview-image="previewUrl = $event; showPreview = true"
        @longpress.native="onLongPress(msg, $event)"
      />
    </div>

    <!-- 非好友限制提示 -->
    <div class="limit-warning" v-if="showLimitWarning">
      <van-notice-bar left-icon="info-o" mode="closeable" @close="showLimitWarning = false">
        非好友限制最多发送5条消息
      </van-notice-bar>
    </div>

    <!-- 输入栏 -->
    <MessageInput
      ref="inputRef"
      :quote-message="quoteMessage"
      @send="onSend"
      @cancel-quote="quoteMessage = null"
    />

    <!-- 图片预览 -->
    <ImagePreview v-model="showPreview" :url="previewUrl" />

    <!-- 消息操作面板 -->
    <van-action-sheet
      v-model:show="showActionSheet"
      :actions="messageActions"
      @select="onMessageAction"
      cancel-text="取消"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { useWebSocketStore } from '@/stores/websocket'
import { useChatStore, type Message } from '@/stores/chat'
import { chatApi } from '@/api/chat'
import { fileApi } from '@/api/file'
import { friendApi } from '@/api/friend'
import MessageBubble from '@/components/MessageBubble.vue'
import MessageInput from '@/components/MessageInput.vue'
import ImagePreview from '@/components/ImagePreview.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const wsStore = useWebSocketStore()
const chatStore = useChatStore()

const chatType = ref<'group' | 'private'>(route.params.type as 'group' || 'group')
const chatId = ref(route.params.id as string)
const chatTitle = ref(route.query.name as string || (chatType.value === 'group' ? '群聊大厅' : '私聊'))

const listRef = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof MessageInput> | null>(null)
const historyLoading = ref(false)
const hasMore = ref(true)
const showPreview = ref(false)
const previewUrl = ref('')
const showActionSheet = ref(false)
const currentMessage = ref<Message | null>(null)
const quoteMessage = ref<Message | null>(null)
const showLimitWarning = ref(false)
const nonFriendCount = ref(0)

const messages = computed(() => {
  if (chatType.value === 'group') return chatStore.groupMessages
  return chatStore.privateMessages[chatId.value] || []
})

const messageActions = computed(() => {
  if (!currentMessage.value) return []
  const actions = [{ name: '引用' }, { name: '复制' }]
  if (currentMessage.value.senderId === authStore.userId) {
    const msgTime = new Date(currentMessage.value.createTime).getTime()
    if (Date.now() - msgTime < 2 * 60 * 1000) {
      actions.push({ name: '撤回' })
    }
    actions.push({ name: '删除', color: '#ee0a24' })
  }
  return actions
})

async function loadHistory() {
  if (historyLoading.value || !hasMore.value) return
  historyLoading.value = true
  try {
    const beforeId = messages.value.length > 0 ? messages.value[0].id : undefined
    let res: any
    if (chatType.value === 'group') {
      res = await chatApi.getGroupHistory(chatId.value, 20, beforeId)
      const records = res.data?.records || res.data || []
      chatStore.prependGroupMessages(records)
      hasMore.value = res.data?.hasMore ?? records.length === 20
    } else {
      res = await chatApi.getPrivateHistory(chatId.value, 20, beforeId)
      const records = res.data?.records || res.data || []
      chatStore.prependPrivateMessages(chatId.value, records)
      hasMore.value = res.data?.hasMore ?? records.length === 20
    }
  } catch { /* handled */ }
  finally { historyLoading.value = false }
}

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  })
}

function onLongPress(msg: Message, _event: Event) {
  currentMessage.value = msg
  showActionSheet.value = true
}

function onMessageAction(action: { name: string }) {
  showActionSheet.value = false
  if (!currentMessage.value) return
  const msg = currentMessage.value

  if (action.name === '引用') {
    quoteMessage.value = msg
  } else if (action.name === '复制') {
    navigator.clipboard?.writeText(msg.content)
    showToast('已复制')
  } else if (action.name === '撤回') {
    onRecall(msg)
  } else if (action.name === '删除') {
    onDelete(msg)
  }
}

async function onRecall(msg: Message) {
  try {
    if (chatType.value === 'group') {
      await chatApi.recallGroupMessage(msg.id)
    } else {
      await chatApi.recallPrivateMessage(msg.id)
    }
    chatStore.recallMessage(msg.id, chatType.value, chatType.value === 'private' ? chatId.value : undefined)
  } catch { /* handled */ }
}

async function onDelete(msg: Message) {
  try {
    if (chatType.value === 'group') {
      await chatApi.deleteGroupMessage(msg.id)
    } else {
      await chatApi.deletePrivateMessage(msg.id)
    }
    chatStore.deleteMessage(msg.id, chatType.value, chatType.value === 'private' ? chatId.value : undefined)
  } catch { /* handled */ }
}

async function onSend(data: any) {
  // Check for pending file upload
  const pendingFile = (window as any).__pendingFile
  const pendingFileType = (window as any).__pendingFileType

  if (pendingFile && pendingFileType) {
    try {
      const api = pendingFileType === 'image' ? fileApi.uploadChatImage : fileApi.uploadChatFile
      const res = await api(pendingFile)
      data.fileUrl = res.data || res.data?.url || ''
    } catch { return }
    delete (window as any).__pendingFile
    delete (window as any).__pendingFileType
  }

  // Check non-friend limit for private chat
  if (chatType.value === 'private') {
    try {
      const profileRes = await friendApi.getProfile(chatId.value)
      if (!profileRes.data?.isFriend) {
        nonFriendCount.value++
        if (nonFriendCount.value >= 5) {
          showLimitWarning.value = true
        }
      }
    } catch { /* ignore */ }
  }

  const wsMsg: Record<string, any> = {
    type: 'chat',
    content: data.content,
    messageType: data.messageType || 'text',
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    fileSize: data.fileSize,
    quoteMessageId: data.quoteMessageId,
    quoteSenderName: data.quoteSenderName,
    quoteContent: data.quoteContent
  }

  if (chatType.value === 'group') {
    wsMsg.chatType = 'group'
    wsMsg.groupId = chatId.value
    wsStore.sendGroupMessage(wsMsg)
  } else {
    wsMsg.receiverId = chatId.value
    wsStore.sendPrivateMessage(wsMsg)
  }

  quoteMessage.value = null
  scrollToBottom()
}

function handleGroupMessage(data: any) {
  if (data.type === 'chat') {
    chatStore.addGroupMessage({ ...data, chatType: 'group', messageType: data.messageType || 'text' })
    scrollToBottom()
  } else if (data.type === 'recall') {
    chatStore.recallMessage(data.messageId, 'group')
  } else if (data.type === 'system') {
    chatStore.addGroupMessage({
      id: Date.now().toString(),
      senderId: 'system',
      senderName: '系统',
      senderAvatar: '',
      content: data.content,
      messageType: 'text',
      createTime: new Date().toISOString(),
      status: 0,
      chatType: 'group'
    })
    scrollToBottom()
  }
}

function handlePrivateMessage(data: any) {
  if (data.type === 'chat') {
    const userId = data.senderId === authStore.userId ? data.receiverId : data.senderId
    chatStore.addPrivateMessage(userId, { ...data, chatType: 'private', messageType: data.messageType || 'text' })
    scrollToBottom()
  } else if (data.type === 'recall') {
    chatStore.recallMessage(data.messageId, 'private', chatId.value)
  }
}

function onBack() {
  wsStore.disconnectGroup()
  wsStore.disconnectPrivate()
  router.back()
}

onMounted(() => {
  if (chatType.value === 'group') {
    wsStore.connectGroup({
      userId: authStore.userId || '',
      username: authStore.username || '',
      avatar: authStore.userInfo?.avatar || ''
    })
    wsStore.addGroupHandler(handleGroupMessage)
  } else {
    wsStore.connectPrivate()
    wsStore.addPrivateHandler(handlePrivateMessage)
  }
  loadHistory().then(() => scrollToBottom())
})

onUnmounted(() => {
  wsStore.disconnectGroup()
  wsStore.disconnectPrivate()
})
</script>

<style scoped>
.chat-room {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

.load-more {
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: #999;
}

.limit-warning {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
