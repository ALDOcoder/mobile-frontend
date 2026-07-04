import request from './request'

export const authApi = {
  login(data: { username: string; password: string; code?: string; uuid?: string }) {
    // 后端 login 接口没有 @RequestBody，需要表单编码格式
    const params = new URLSearchParams()
    params.append('username', data.username)
    params.append('password', data.password)
    if (data.code) params.append('code', data.code)
    if (data.uuid) params.append('uuid', data.uuid)
    return request.post('/security/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  logout() {
    return request.post('/security/logout')
  },
  getCaptcha() {
    return request.get('/captcha/generate')
  },
  verifyCaptcha(uuid: string, code: string) {
    return request.get('/captcha/verify', { params: { uuid, code } })
  }
}

export const registerApi = {
  sendCode(email: string) {
    return request.post('/register/send-code', { email })
  },
  checkUsername(username: string) {
    return request.get('/register/check-username', { params: { username } })
  },
  checkEmail(email: string) {
    return request.get('/register/check-email', { params: { email } })
  },
  register(data: {
    username: string
    password: string
    confirmPassword: string
    email: string
    emailCode: string
    phone?: string
    sex?: string
    avatarUrl?: string
  }) {
    return request.post('/register', data)
  }
}

export const passwordApi = {
  sendCode(username: string, email: string) {
    return request.post('/password-reset/send-code', null, { params: { username, email } })
  },
  verifyCode(data: { username: string; email: string; code: string }) {
    return request.post('/password-reset/verify-code', data)
  },
  reset(data: { username: string; email: string; code: string; newPassword: string }) {
    return request.post('/password-reset/reset', data)
  }
}
