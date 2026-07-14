<template>
  <div class="friends-page">
    <!-- 搜索框 -->
    <div class="search-bar" @click="router.push('/search')">
      <van-search shape="round" placeholder="搜索用户" readonly />
    </div>

    <van-tabs v-model:active="tab" @click="onTabChange">
      <van-tab title="好友列表">
        <van-pull-refresh v-model="refreshing" @refresh="loadFriends">
          <div ref="friendListRef">
            <van-cell
              v-for="f in friends"
              :key="f.friendId || f.id"
              :title="f.remark || f.username"
              :label="f.email || ''"
              is-link
              class="friend-cell"
              @click="showFriendAction(f)"
            >
              <template #icon>
                <van-image round width="40" height="40" :src="f.avatar || defaultAvatar" class="friend-avatar" />
              </template>
            </van-cell>
          </div>
        </van-pull-refresh>
        <van-empty v-if="friends.length === 0" description="暂无好友" />
      </van-tab>

      <van-tab title="好友请求">
        <!-- 子标签切换 -->
        <van-tabs v-model:active="reqTab" type="card" class="req-sub-tabs" @click="onReqTabChange">
          <van-tab title="收到的请求">
            <van-pull-refresh v-model="reqRefreshing" @refresh="loadRequests">
              <div ref="requestListRef">
                <div v-for="r in requests" :key="r.requestId" class="request-item">
                  <van-image round width="40" height="40" :src="r.avatar || defaultAvatar" />
                  <div class="req-info">
                    <span class="req-name">{{ r.username }}</span>
                    <span class="req-msg">{{ r.message || '请求添加你为好友' }}</span>
                  </div>
                  <div v-if="r.status === 0" class="req-actions">
                    <van-button size="small" type="primary" @click="handleRequest(r.requestId, true)">同意</van-button>
                    <van-button size="small" @click="handleRequest(r.requestId, false)">拒绝</van-button>
                  </div>
                  <div v-else class="req-status">
                    <van-tag v-if="r.status === 1" type="success">已同意</van-tag>
                    <van-tag v-else type="danger">已拒绝</van-tag>
                  </div>
                </div>
              </div>
            </van-pull-refresh>
            <van-empty v-if="requests.length === 0" description="暂无收到的请求" />
          </van-tab>

          <van-tab title="已发送">
            <van-pull-refresh v-model="sentRefreshing" @refresh="loadSentRequests">
              <div ref="sentListRef">
                <div v-for="r in sentRequests" :key="r.requestId" class="request-item">
                  <van-image round width="40" height="40" :src="r.avatar || defaultAvatar" />
                  <div class="req-info">
                    <span class="req-name">{{ r.username }}</span>
                    <span class="req-msg">{{ r.message || '等待对方确认' }}</span>
                  </div>
                  <div class="req-status">
                    <van-tag v-if="r.status === 0" type="warning">等待确认</van-tag>
                    <van-tag v-else-if="r.status === 1" type="success">已同意</van-tag>
                    <van-tag v-else type="danger">已拒绝</van-tag>
                  </div>
                </div>
              </div>
            </van-pull-refresh>
            <van-empty v-if="sentRequests.length === 0" description="暂无已发送的请求" />
          </van-tab>
        </van-tabs>
      </van-tab>
    </van-tabs>

    <!-- 好友操作面板 -->
    <van-action-sheet
      v-model:show="showActions"
      :actions="actionList"
      @select="onActionSelect"
      cancel-text="取消"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { friendApi } from '@/api/friend'
import gsap from 'gsap'

const router = useRouter()
const tab = ref(0)
const reqTab = ref(0)
const refreshing = ref(false)
const reqRefreshing = ref(false)
const sentRefreshing = ref(false)
const friends = ref<any[]>([])
const requests = ref<any[]>([])
const sentRequests = ref<any[]>([])
const showActions = ref(false)
const currentFriend = ref<any>(null)
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSIyNCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjgiIGZpbGw9IiNjY2MiLz48ZWxsaXBzZSBjeD0iMjQiIGN5PSI0NCIgcng9IjE0IiByeT0iMTAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='

const actionList = [
  { name: '发消息' },
  { name: '删除好友', color: '#ee0a24' },
  { name: '拉黑', color: '#ee0a24' }
]

// Template refs
const friendListRef = ref<HTMLElement | null>(null)
const requestListRef = ref<HTMLElement | null>(null)
const sentListRef = ref<HTMLElement | null>(null)

// 动画函数
function animateListItems(container: HTMLElement | null) {
  if (!container) return
  const items = container.querySelectorAll('.van-cell, .request-item')
  if (items.length === 0) return

  gsap.from(items, {
    autoAlpha: 0,
    y: 20,
    duration: 0.4,
    stagger: 0.05,
    ease: 'power2.out',
    clearProps: 'all'
  })
}

function animateTabContent() {
  nextTick(() => {
    const activeTab = document.querySelector('.van-tab__pane--active')
    if (activeTab) {
      gsap.from(activeTab, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power1.out'
      })
    }
  })
}

function onTabChange() {
  animateTabContent()
}

function onReqTabChange() {
  animateTabContent()
  nextTick(() => {
    if (reqTab.value === 0) {
      animateListItems(requestListRef.value)
    } else {
      animateListItems(sentListRef.value)
    }
  })
}

async function loadFriends() {
  try {
    const res = await friendApi.getList()
    friends.value = res.data || []
    await nextTick()
    animateListItems(friendListRef.value)
  } catch { /* handled */ }
  finally { refreshing.value = false }
}

async function loadRequests() {
  try {
    const res = await friendApi.getRequests()
    requests.value = res.data || []
    await nextTick()
    animateListItems(requestListRef.value)
  } catch { /* handled */ }
  finally { reqRefreshing.value = false }
}

async function loadSentRequests() {
  try {
    const res = await friendApi.getSentRequests()
    sentRequests.value = res.data || []
    await nextTick()
    animateListItems(sentListRef.value)
  } catch { /* handled */ }
  finally { sentRefreshing.value = false }
}

async function handleRequest(id: string, accept: boolean) {
  try {
    await friendApi.handleRequest(id, accept)
    showToast(accept ? '已同意' : '已拒绝')
    loadRequests()
    if (accept) loadFriends()
  } catch { /* handled */ }
}

function showFriendAction(f: any) {
  currentFriend.value = f
  showActions.value = true
}

function onActionSelect(action: { name: string }) {
  showActions.value = false
  if (action.name === '发消息') {
    const f = currentFriend.value
    router.push(`/chat/private/${f.friendId || f.id}?name=${encodeURIComponent(f.remark || f.username)}`)
  } else if (action.name === '删除好友') {
    showConfirmDialog({
      title: '确认删除',
      message: '确定要删除该好友吗？'
    }).then(async () => {
      await friendApi.deleteFriend(currentFriend.value.friendId || currentFriend.value.id)
      showToast('已删除')
      loadFriends()
    }).catch(() => {})
  } else if (action.name === '拉黑') {
    showConfirmDialog({
      title: '确认拉黑',
      message: '拉黑后将无法收到对方消息'
    }).then(async () => {
      await friendApi.block(currentFriend.value.friendId || currentFriend.value.id)
      showToast('已拉黑')
      loadFriends()
    }).catch(() => {})
  }
}

onMounted(() => {
  loadFriends()
  loadRequests()
  loadSentRequests()
})
</script>

<style scoped>
.friends-page {
  background: #fff;
  min-height: 100%;
}

.search-bar {
  background: #fff;
}

.friend-avatar {
  margin-right: 12px;
}

.friend-cell {
  will-change: transform, opacity;
}

.req-sub-tabs {
  margin-top: 12px;
  padding: 0 16px;
}

:deep(.van-tabs--card > .van-tabs__wrap) {
  border: none;
}

:deep(.van-tabs--card .van-tab) {
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

:deep(.van-tabs--card .van-tab--active) {
  background: #07c160;
  border-color: #07c160;
  color: #fff;
}

:deep(.van-tabs--card > .van-tabs__wrap .van-tabs__nav) {
  border: none;
  background: transparent;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  will-change: transform, opacity;
}

.req-info {
  flex: 1;
}

.req-name {
  font-size: 15px;
  font-weight: 500;
  display: block;
}

.req-msg {
  font-size: 12px;
  color: #999;
}

.req-actions {
  display: flex;
  gap: 8px;
}

.req-status {
  flex-shrink: 0;
}
</style>
