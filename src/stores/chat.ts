import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  receiverId?: string
  content: string
  messageType: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createTime: string
  status: number
  quoteMessageId?: string
  quoteSenderName?: string
  quoteContent?: string
  isRead?: boolean
  chatType?: 'group' | 'private'
  groupId?: string
  onlineCount?: number
}

export interface Conversation {
  otherUserId: string
  username: string
  avatar: string
  lastMessage: string
  lastTime: string
  unreadCount: number
}

export const useChatStore = defineStore('chat', () => {
  const groupMessages = ref<Message[]>([])
  const privateMessages = ref<Record<string, Message[]>>({})
  const conversations = ref<Conversation[]>([])
  const unreadCounts = ref<Record<string, number>>({})
  const onlineUsers = ref<string[]>([])

  function addGroupMessage(msg: Message) {
    groupMessages.value.push(msg)
  }

  function setGroupMessages(msgs: Message[]) {
    groupMessages.value = msgs
  }

  function prependGroupMessages(msgs: Message[]) {
    groupMessages.value = [...msgs, ...groupMessages.value]
  }

  function addPrivateMessage(userId: string, msg: Message) {
    if (!privateMessages.value[userId]) {
      privateMessages.value[userId] = []
    }
    privateMessages.value[userId].push(msg)
  }

  function setPrivateMessages(userId: string, msgs: Message[]) {
    privateMessages.value[userId] = msgs
  }

  function prependPrivateMessages(userId: string, msgs: Message[]) {
    if (!privateMessages.value[userId]) {
      privateMessages.value[userId] = []
    }
    privateMessages.value[userId] = [...msgs, ...privateMessages.value[userId]]
  }

  function recallMessage(messageId: string, chatType: 'group' | 'private', userId?: string) {
    if (chatType === 'group') {
      const msg = groupMessages.value.find(m => m.id === messageId)
      if (msg) msg.status = 1
    } else if (userId && privateMessages.value[userId]) {
      const msg = privateMessages.value[userId].find(m => m.id === messageId)
      if (msg) msg.status = 1
    }
  }

  function deleteMessage(messageId: string, chatType: 'group' | 'private', userId?: string) {
    if (chatType === 'group') {
      groupMessages.value = groupMessages.value.filter(m => m.id !== messageId)
    } else if (userId && privateMessages.value[userId]) {
      privateMessages.value[userId] = privateMessages.value[userId].filter(m => m.id !== messageId)
    }
  }

  function setConversations(convos: Conversation[]) {
    conversations.value = convos
  }

  function setUnreadCounts(counts: Record<string, number>) {
    unreadCounts.value = counts
  }

  function setOnlineUsers(users: string[]) {
    onlineUsers.value = users
  }

  function getMessages(userId?: string): Message[] {
    if (userId) return privateMessages.value[userId] || []
    return groupMessages.value
  }

  return {
    groupMessages, privateMessages, conversations, unreadCounts, onlineUsers,
    addGroupMessage, setGroupMessages, prependGroupMessages,
    addPrivateMessage, setPrivateMessages, prependPrivateMessages,
    recallMessage, deleteMessage,
    setConversations, setUnreadCounts, setOnlineUsers,
    getMessages
  }
})
