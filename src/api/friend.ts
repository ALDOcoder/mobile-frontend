import request from './request'

export const friendApi = {
  getProfile(userId: string) {
    return request.get(`/friend/profile/${userId}`)
  },
  sendRequest(toUserId: string, message?: string) {
    return request.post('/friend/request', { toUserId, message })
  },
  handleRequest(requestId: string, accept: boolean) {
    return request.post('/friend/handle', { requestId, accept })
  },
  getList() {
    return request.get('/friend/list')
  },
  getRequests() {
    return request.get('/friend/requests')
  },
  deleteFriend(friendId: string) {
    return request.delete(`/friend/${friendId}`)
  },
  setRemark(friendId: string, remark: string) {
    return request.post('/friend/remark', { friendId, remark })
  },
  block(friendId: string) {
    return request.post('/friend/block', { friendId })
  },
  unblock(friendId: string) {
    return request.post('/friend/unblock', { friendId })
  }
}
