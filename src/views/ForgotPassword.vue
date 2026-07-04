<template>
  <div class="forgot-page">
    <van-nav-bar title="忘记密码" left-text="返回" left-arrow @click-left="router.back" />

    <van-steps :active="step" class="steps-bar">
      <van-step>验证身份</van-step>
      <van-step>重置密码</van-step>
      <van-step>完成</van-step>
    </van-steps>

    <!-- Step 1: 验证身份 -->
    <van-form v-if="step === 0" @submit="onVerifyIdentity">
      <van-cell-group inset>
        <van-field v-model="form.username" label="用户名" placeholder="请输入用户名" :rules="[{ required: true }]" clearable />
        <van-field v-model="form.email" label="邮箱" placeholder="请输入邮箱" :rules="[{ required: true }]" clearable />
        <van-field v-model="form.code" label="验证码" placeholder="邮箱验证码" :rules="[{ required: true }]" clearable>
          <template #button>
            <van-button size="small" type="primary" :disabled="countdown > 0" @click="sendCode" native-type="button">
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>
      <div class="btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading1">下一步</van-button>
      </div>
    </van-form>

    <!-- Step 2: 重置密码 -->
    <van-form v-if="step === 1" @submit="onResetPassword">
      <van-cell-group inset>
        <van-field v-model="form.newPassword" type="password" label="新密码" placeholder="6-20位" :rules="[{ required: true }, { pattern: /^.{6,20}$/, message: '6-20位字符' }]" clearable />
        <van-field v-model="form.confirmNew" type="password" label="确认密码" placeholder="再次输入" :rules="[{ required: true }, { validator: validateNew, message: '两次密码不一致' }]" clearable />
      </van-cell-group>
      <div class="btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading2">重置密码</van-button>
      </div>
    </van-form>

    <!-- Step 3: 完成 -->
    <div v-if="step === 2" class="success-box">
      <van-icon name="success" size="64" color="#07c160" />
      <p>密码重置成功</p>
      <van-button round block type="primary" @click="router.replace('/login')">返回登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { passwordApi } from '@/api/auth'

const router = useRouter()
const step = ref(0)
const loading1 = ref(false)
const loading2 = ref(false)
const countdown = ref(0)

const form = reactive({
  username: '',
  email: '',
  code: '',
  newPassword: '',
  confirmNew: ''
})

function validateNew(val: string) {
  return val === form.newPassword
}

let timer: ReturnType<typeof setInterval> | null = null

async function sendCode() {
  if (!form.username || !form.email) {
    showToast('请先输入用户名和邮箱')
    return
  }
  try {
    await passwordApi.sendCode(form.username, form.email)
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

async function onVerifyIdentity() {
  loading1.value = true
  try {
    await passwordApi.verifyCode({
      username: form.username,
      email: form.email,
      code: form.code
    })
    step.value = 1
  } catch { /* handled */ }
  finally { loading1.value = false }
}

async function onResetPassword() {
  loading2.value = true
  try {
    await passwordApi.reset({
      username: form.username,
      email: form.email,
      code: form.code,
      newPassword: form.newPassword
    })
    step.value = 2
  } catch { /* handled */ }
  finally { loading2.value = false }
}
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.steps-bar {
  padding: 16px;
  background: #fff;
}

.btn-wrap {
  margin: 24px 16px;
}

.success-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 16px;
  gap: 20px;
}

.success-box p {
  font-size: 18px;
  color: #333;
}

.success-box .van-button {
  width: 200px;
  margin-top: 20px;
}
</style>
