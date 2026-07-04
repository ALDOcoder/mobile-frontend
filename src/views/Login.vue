<template>
  <div class="login-page">
    <div class="login-header">
      <h1>雅集聊天室</h1>
      <p>随时随地，畅快交流</p>
    </div>

    <van-form @submit="onLogin">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
          left-icon="user-o"
          clearable
        />
        <van-field
          v-model="form.password"
          name="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          left-icon="lock"
          clearable
        />
        <van-field
          v-model="form.code"
          name="code"
          label="验证码"
          placeholder="验证码"
          center
          clearable
        >
          <template #left-icon>
            <van-icon name="shield-o" />
          </template>
          <template #button>
            <img :src="captchaImage" class="captcha-img" @click="refreshCaptcha" alt="验证码" />
          </template>
        </van-field>
      </van-cell-group>

      <div class="login-btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>

      <div class="login-links">
        <router-link to="/register">注册账号</router-link>
        <router-link to="/forgot">忘记密码</router-link>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

const captchaImage = ref('')

async function refreshCaptcha() {
  try {
    const res = await authApi.getCaptcha()
    captchaImage.value = res.data.image
    form.uuid = res.data.uuid
  } catch { /* handled by interceptor */ }
}

async function onLogin() {
  loading.value = true
  try {
    await authStore.login(form.username, form.password, form.code || undefined, form.uuid || undefined)
    showToast('登录成功')
    router.replace('/home')
  } catch { /* handled by interceptor */ }
  finally { loading.value = false }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #07c160 0%, #10aeff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-header {
  text-align: center;
  padding: 60px 20px 30px;
  color: #fff;
}

.login-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.8;
}

.login-page :deep(.van-form) {
  width: 100%;
  max-width: 360px;
  padding: 0 16px;
}

.login-btn-wrap {
  margin: 24px 16px;
}

.login-links {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}

.login-links a {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  text-decoration: none;
}

.captcha-img {
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
