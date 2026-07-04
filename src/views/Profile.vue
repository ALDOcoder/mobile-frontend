<template>
  <div class="profile-page">
    <div class="profile-header">
      <van-image round width="72" height="72" :src="user?.avatar || defaultAvatar" />
      <h3>{{ user?.username || '未登录' }}</h3>
      <p>{{ user?.email || '' }}</p>
    </div>

    <van-cell-group inset>
      <van-cell title="编辑资料" is-link to="/profile/edit" icon="edit" />
      <van-cell title="修改密码" is-link @click="showPasswordDialog = true" icon="lock" />
      <van-cell title="退出登录" is-link @click="onLogout" icon="revoke" />
    </van-cell-group>

    <!-- 修改密码弹窗 -->
    <van-dialog
      v-model:show="showPasswordDialog"
      title="修改密码"
      show-cancel-button
      @confirm="changePassword"
    >
      <div class="password-form">
        <van-field v-model="passwordForm.oldPassword" type="password" label="旧密码" placeholder="请输入旧密码" />
        <van-field v-model="passwordForm.newPassword" type="password" label="新密码" placeholder="6-20位" />
        <van-field v-model="passwordForm.confirmNew" type="password" label="确认密码" placeholder="再次输入" />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { useWebSocketStore } from '@/stores/websocket'
import { userApi } from '@/api/user'

const router = useRouter()
const authStore = useAuthStore()
const wsStore = useWebSocketStore()
const user = ref<any>(null)
const showPasswordDialog = ref(false)
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSIyNCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjgiIGZpbGw9IiNjY2MiLz48ZWxsaXBzZSBjeD0iMjQiIGN5PSI0NCIgcng9IjE0IiByeT0iMTAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmNew: ''
})

onMounted(async () => {
  user.value = authStore.userInfo
  if (!user.value) {
    try {
      await authStore.fetchUserInfo()
      user.value = authStore.userInfo
    } catch { /* handled */ }
  }
})

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmNew) {
    showToast('两次密码不一致')
    return
  }
  try {
    await userApi.changePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword)
    showSuccessToast('密码修改成功')
    showPasswordDialog.value = false
    passwordForm.value = { oldPassword: '', newPassword: '', confirmNew: '' }
  } catch { /* handled */ }
}

async function onLogout() {
  await authStore.logout()
  wsStore.disconnectAll()
  router.replace('/login')
}
</script>

<style scoped>
.profile-page {
  min-height: 100%;
  background: #f5f5f5;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 16px 20px;
  background: #fff;
  margin-bottom: 12px;
}

.profile-header h3 {
  font-size: 18px;
  margin-top: 12px;
}

.profile-header p {
  color: #999;
  font-size: 13px;
  margin-top: 4px;
}

.password-form {
  padding: 12px 0;
}
</style>
