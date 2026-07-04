<template>
  <div class="profile-edit-page">
    <van-nav-bar title="编辑资料" left-text="返回" left-arrow @click-left="router.back" />

    <div class="avatar-section">
      <van-image round width="80" height="80" :src="avatar || defaultAvatar" />
      <van-uploader :after-read="onAvatarRead" :max-count="1" accept="image/*">
        <van-button size="small" type="primary">更换头像</van-button>
      </van-uploader>
    </div>

    <van-cell-group inset>
      <van-field v-model="form.username" label="用户名" placeholder="3-20位字母数字" clearable />
      <van-field v-model="form.phone" label="手机号" placeholder="选填" clearable />
      <van-field name="sex" label="性别">
        <template #input>
          <van-radio-group v-model="form.sex" direction="horizontal">
            <van-radio name="男">男</van-radio>
            <van-radio name="女">女</van-radio>
            <van-radio name="保密">保密</van-radio>
          </van-radio-group>
        </template>
      </van-field>
    </van-cell-group>

    <div class="save-wrap">
      <van-button round block type="primary" :loading="saving" @click="onSave">保存</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/user'

const router = useRouter()
const authStore = useAuthStore()
const saving = ref(false)
const avatar = ref('')
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSIyNCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjgiIGZpbGw9IiNjY2MiLz48ZWxsaXBzZSBjeD0iMjQiIGN5PSI0NCIgcng9IjE0IiByeT0iMTAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='

const form = reactive({
  username: '',
  phone: '',
  sex: '保密'
})

onMounted(() => {
  const user = authStore.userInfo
  if (user) {
    form.username = user.username || ''
    form.phone = user.phone || ''
    form.sex = user.sex || '保密'
    avatar.value = user.avatar || ''
  }
})

async function onAvatarRead(file: any) {
  try {
    const res = await userApi.uploadAvatar(file.file as File)
    avatar.value = res.data || ''
    showSuccessToast('头像已更新')
  } catch { /* handled */ }
}

async function onSave() {
  saving.value = true
  try {
    await userApi.updateInfo({
      username: form.username,
      phone: form.phone || undefined,
      sex: form.sex
    })
    await authStore.fetchUserInfo()
    showSuccessToast('保存成功')
    router.back()
  } catch { /* handled */ }
  finally { saving.value = false }
}
</script>

<style scoped>
.profile-edit-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: #fff;
  margin-bottom: 12px;
}

.save-wrap {
  margin: 24px 16px;
}
</style>
