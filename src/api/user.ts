import request from './request'

export const userApi = {
  getInfo() {
    return request.get('/user/info')
  },
  updateInfo(data: { username?: string; phone?: string; sex?: string }) {
    return request.put('/user/info', data)
  },
  uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  changePassword(oldPassword: string, newPassword: string) {
    return request.post('/user/password', { oldPassword, newPassword })
  },
  search(keyword: string) {
    return request.get('/user/search', { params: { keyword } })
  }
}
