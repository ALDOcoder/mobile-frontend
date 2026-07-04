import request from './request'

export const fileApi = {
  uploadRegisterAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/file/upload-register-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadChatImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/file/upload-chat-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadChatFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/file/upload-chat-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  download(url: string, fileName: string) {
    return request.get('/file/download', {
      params: { url, fileName },
      responseType: 'blob'
    })
  }
}
