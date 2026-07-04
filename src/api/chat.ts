import request from './request'

export const chatApi = {
  getGroupHistory(groupId: string, pageSize: number, beforeMessageId?: string) {
    return request.get('/chat/message/history', {
      params: { groupId, pageSize, beforeMessageId }
    })
  },
  recallGroupMessage(messageId: string) {
    return request.post(`/chat/message/recall/${messageId}`)
  },
  deleteGroupMessage(messageId: string) {
    return request.post('/chat/message/delete-for-me', null, { params: { messageId } })
  },
  getPrivateHistory(otherUserId: string, pageSize: number, beforeMessageId?: string) {
    return request.get('/private/chat/history', {
      params: { otherUserId, pageSize, beforeMessageId }
    })
  },
  getConversations() {
    return request.get('/private/chat/conversations')
  },
  getUnreadCounts() {
    return request.get('/private/chat/unread-counts')
  },
  getOnlineUsers() {
    return request.get('/private/chat/online-users')
  },
  recallPrivateMessage(messageId: string) {
    return request.post(`/private/chat/recall/${messageId}`)
  },
  deletePrivateMessage(messageId: string) {
    return request.post('/private/chat/delete-for-me', { messageId })
  },
  clearUnread(senderId: string) {
    return request.post('/private/chat/clear-unread', { senderId })
  },
  markRead(senderId: string) {
    return request.post('/private/chat/mark-read', { senderId })
  }
}
