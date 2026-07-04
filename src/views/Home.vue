<template>
  <div class="home-page">
    <!-- Tab content -->
    <div v-show="activeTab === 'chat'" class="tab-content">
      <!-- 群聊入口 -->
      <div class="group-chat-entry" @click="goGroupChat">
        <van-icon name="chat-o" size="20" />
        <span>群聊大厅</span>
        <van-badge :content="onlineCount" v-if="onlineCount > 0" />
        <van-icon name="arrow" class="arrow-right" />
      </div>

      <!-- 会话列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="loadConversations">
        <van-list
          v-model:loading="listLoading"
          :finished="listFinished"
          finished-text="没有更多了"
          @load="loadConversations"
        >
          <div
            v-for="item in conversations"
            :key="item.otherUserId"
            class="conversation-item"
            @click="goPrivateChat(item.otherUserId, item.username)"
          >
            <van-image round width="48" height="48" :src="item.avatar || defaultAvatar" />
            <div class="conv-info">
              <div class="conv-top">
                <span class="conv-name">{{ item.username }}</span>
                <span class="conv-time">{{ formatConversationTime(item.lastTime) }}</span>
              </div>
              <div class="conv-bottom">
                <span class="conv-msg">{{ item.lastMessage }}</span>
                <van-badge :content="item.unreadCount" v-if="item.unreadCount > 0" />
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>

      <van-empty v-if="!listLoading && conversations.length === 0" description="暂无会话" />
    </div>

    <div v-show="activeTab === 'friends'" class="tab-content">
      <FriendsView />
    </div>

    <div v-show="activeTab === 'profile'" class="tab-content">
      <ProfileView />
    </div>

    <!-- Bottom Tabbar -->
    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="chat-o" name="chat">消息</van-tabbar-item>
      <van-tabbar-item icon="friends-o" name="friends" :badge="totalUnread">好友</van-tabbar-item>
      <van-tabbar-item icon="user-o" name="profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore, type Conversation } from '@/stores/chat'
import { useWebSocketStore } from '@/stores/websocket'
import { useAuthStore } from '@/stores/auth'
import { chatApi } from '@/api/chat'
import { formatConversationTime } from '@/utils/format'
import FriendsView from '@/views/Friends.vue'
import ProfileView from '@/views/Profile.vue'

const router = useRouter()
const chatStore = useChatStore()
const wsStore = useWebSocketStore()
const authStore = useAuthStore()

const activeTab = ref('chat')
const refreshing = ref(false)
const listLoading = ref(false)
const listFinished = ref(false)
const conversations = ref<Conversation[]>([])
const onlineCount = ref(0)
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSIyNCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjgiIGZpbGw9IiNjY2MiLz48ZWxsaXBzZSBjeD0iMjQiIGN5PSI0NCIgcng9IjE0IiByeT0iMTAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='

const totalUnread = computed(() => {
  return conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
})

function goGroupChat() {
  router.push('/chat/group/default')
}

function goPrivateChat(userId: string, username: string) {
  router.push(`/chat/private/${userId}?name=${encodeURIComponent(username)}`)
}

async function loadConversations() {
  try {
    const res = await chatApi.getConversations()
    conversations.value = res.data || []
    chatStore.setConversations(conversations.value)
    listFinished.value = true
  } catch { /* handled */ }
  finally {
    refreshing.value = false
    listLoading.value = false
  }
}

onMounted(() => {
  loadConversations()
  wsStore.connectPrivate()
})
</script>

<style scoped>
.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px;
}

.group-chat-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  margin-bottom: 8px;
  font-size: 15px;
  cursor: pointer;
}

.arrow-right {
  margin-left: auto;
  color: #999;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.conversation-item:active {
  background: #f5f5f5;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.conv-name {
  font-size: 15px;
  font-weight: 500;
}

.conv-time {
  font-size: 12px;
  color: #999;
}

.conv-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conv-msg {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
</style>
