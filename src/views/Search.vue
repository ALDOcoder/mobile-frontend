<template>
  <div class="search-page">
    <van-nav-bar title="搜索用户" left-text="返回" left-arrow @click-left="router.back" />

    <van-search v-model="keyword" shape="round" placeholder="搜索用户名或邮箱" show-action @search="onSearch" @cancel="router.back()" />

    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
      <van-cell
        v-for="user in users"
        :key="user.id"
        @click="showUserProfile(user)"
      >
        <template #icon>
          <van-image round width="40" height="40" :src="user.avatar || defaultAvatar" class="user-avatar" />
        </template>
        <template #title>
          <span>{{ user.username }}</span>
        </template>
        <template #label>
          <span>{{ user.email || '' }}</span>
        </template>
      </van-cell>
    </van-list>

    <van-empty v-if="!loading && searched && users.length === 0" description="未找到用户" />

    <!-- 用户资料弹窗 -->
    <van-action-sheet
      v-model:show="showProfile"
      title="用户信息"
    >
      <div class="profile-popup" v-if="profileUser">
        <van-image round width="64" height="64" :src="profileUser.avatar || defaultAvatar" />
        <h3>{{ profileUser.username }}</h3>
        <p v-if="profileUser.email">{{ profileUser.email }}</p>
        <div class="profile-actions">
          <van-button
            v-if="!profileUser.isFriend && !profileUser.hasPendingRequest"
            type="primary" block round size="small"
            @click="addFriend"
          >添加好友</van-button>
          <van-button
            v-else-if="profileUser.isFriend"
            type="primary" block round size="small"
            @click="sendMessage"
          >发消息</van-button>
          <van-tag v-else type="warning">已发送请求</van-tag>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api/user'
import { friendApi } from '@/api/friend'

const router = useRouter()
const keyword = ref('')
const users = ref<any[]>([])
const loading = ref(false)
const finished = ref(true)
const searched = ref(false)
const showProfile = ref(false)
const profileUser = ref<any>(null)
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSIyNCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjgiIGZpbGw9IiNjY2MiLz48ZWxsaXBzZSBjeD0iMjQiIGN5PSI0NCIgcng9IjE0IiByeT0iMTAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='

async function onSearch(val?: string) {
  const kw = val || keyword.value
  if (!kw) return
  loading.value = true
  searched.value = true
  try {
    const res = await userApi.search(kw)
    users.value = res.data || []
  } catch { /* handled */ }
  finally { loading.value = false }
}

async function showUserProfile(user: any) {
  try {
    const res = await friendApi.getProfile(user.id)
    profileUser.value = { ...user, ...res.data }
    showProfile.value = true
  } catch { /* handled */ }
}

async function addFriend() {
  if (!profileUser.value) return
  try {
    await friendApi.sendRequest(profileUser.value.id)
    showToast('好友请求已发送')
    showProfile.value = false
  } catch { /* handled */ }
}

function sendMessage() {
  if (!profileUser.value) return
  showProfile.value = false
  router.push(`/chat/private/${profileUser.value.id}?name=${encodeURIComponent(profileUser.value.username)}`)
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-avatar {
  margin-right: 12px;
}

.profile-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px 24px;
  gap: 8px;
}

.profile-popup h3 {
  font-size: 18px;
}

.profile-popup p {
  color: #999;
  font-size: 13px;
}

.profile-actions {
  width: 100%;
  margin-top: 12px;
  text-align: center;
}
</style>
