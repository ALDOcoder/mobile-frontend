<template>
  <div class="register-page">
    <van-nav-bar title="注册账号" left-text="返回" left-arrow @click-left="router.back" />

    <van-form @submit="onRegister">
      <van-cell-group inset>
        <van-field
          v-model="form.username"
          name="username"
          label="用户名"
          placeholder="3-20位字母数字"
          :rules="[{ required: true }, { pattern: /^[a-zA-Z0-9]{3,20}$/, message: '3-20位字母数字' }]"
          clearable
        />
        <van-field
          v-model="form.password"
          name="password"
          type="password"
          label="密码"
          placeholder="6-20位"
          :rules="[{ required: true }, { pattern: /^.{6,20}$/, message: '6-20位字符' }]"
          clearable
        />
        <van-field
          v-model="form.confirmPassword"
          name="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="再次输入密码"
          :rules="[{ required: true, message: '请确认密码' }, { validator: validateConfirm, message: '两次密码不一致' }]"
          clearable
        />
        <van-field
          v-model="form.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          :rules="[{ required: true, message: '请输入邮箱' }, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }]"
          clearable
        />
        <van-field
          v-model="form.emailCode"
          name="emailCode"
          label="验证码"
          placeholder="邮箱验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
          clearable
        >
          <template #button>
            <van-button size="small" type="primary" :disabled="countdown > 0" @click="sendCode" native-type="button">
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>
        <van-field v-model="form.phone" name="phone" label="手机号" placeholder="选填" clearable />
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

      <div class="register-btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { registerApi } from '@/api/auth'

const router = useRouter()
const loading = ref(false)
const countdown = ref(0)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  emailCode: '',
  phone: '',
  sex: '保密'
})

function validateConfirm(val: string) {
  return val === form.password
}

let timer: ReturnType<typeof setInterval> | null = null

async function sendCode() {
  if (!form.email) {
    showToast('请先输入邮箱')
    return
  }
  try {
    await registerApi.sendCode(form.email)
    showToast('验证码已发送')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer!)
        timer = null
      }
    }, 1000)
  } catch { /* handled */ }
}

async function onRegister() {
  loading.value = true
  try {
    await registerApi.register({
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
      email: form.email,
      emailCode: form.emailCode,
      phone: form.phone || undefined,
      sex: form.sex
    })
    showSuccessToast('注册成功')
    setTimeout(() => router.replace('/login'), 1500)
  } catch { /* handled */ }
  finally { loading.value = false }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.register-btn-wrap {
  margin: 24px 16px;
}
</style>
