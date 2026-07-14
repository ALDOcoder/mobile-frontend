<template>
  <div class="message-bubble" :class="isSelf ? 'bubble-self' : 'bubble-other'">
    <!-- 头像 -->
    <div class="bubble-avatar" v-if="!isSelf">
      <van-image round width="36" height="36" :src="message.senderAvatar || defaultAvatar" />
    </div>

    <div class="bubble-content" :class="{ 'content-self': isSelf }">
      <!-- 发送者名称（群聊时显示） -->
      <div class="bubble-name" v-if="!isSelf && showName">{{ message.senderName }}</div>

      <!-- 引用消息 -->
      <div class="quote-block" v-if="message.quoteContent" @click="$emit('scrollTo', message.quoteMessageId)">
        <span class="quote-name">{{ message.quoteSenderName }}：</span>
        <span class="quote-text">{{ message.quoteContent }}</span>
      </div>

      <!-- 消息体 -->
      <div class="bubble-body" @longpress="onLongPress">
        <!-- 撤回的消息 -->
        <span v-if="message.status === 1" class="recalled-text">消息已撤回</span>

        <!-- 图片 -->
        <van-image
          v-else-if="message.messageType === 'image'"
          :src="message.fileUrl"
          width="160"
          fit="cover"
          radius="8"
          @click="$emit('previewImage', message.fileUrl)"
        />

        <!-- 文件 -->
        <a v-else-if="message.messageType === 'file'" :href="message.fileUrl" class="file-link" target="_blank">
          <van-icon name="description" size="20" />
          <span>{{ message.fileName || '文件' }}</span>
        </a>

        <!-- 文本 -->
        <span v-else class="text-content">{{ message.content }}</span>
      </div>

      <!-- 时间 -->
      <div class="bubble-time" :class="{ 'time-self': isSelf }">
        {{ formatTime(message.createTime) }}
      </div>
    </div>

    <!-- 自己头像 -->
    <div class="bubble-avatar" v-if="isSelf">
      <van-image round width="36" height="36" :src="message.senderAvatar || defaultAvatar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatTime } from '@/utils/format'
import type { Message } from '@/stores/chat'

const props = defineProps<{
  message: Message
  showName?: boolean
}>()

defineEmits<{
  scrollTo: [messageId: string]
  previewImage: [url: string]
  longpress: [message: Message]
}>()

const authStore = useAuthStore()
const isSelf = computed(() => props.message.senderId === authStore.userId)
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSIyNCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iMTgiIHI9IjgiIGZpbGw9IiNjY2MiLz48ZWxsaXBzZSBjeD0iMjQiIGN5PSI0NCIgcng9IjE0IiByeT0iMTAiIGZpbGw9IiNjY2MiLz48L3N2Zz4='

function onLongPress() {
  if (props.message.status !== 1) {
    // Use touch events handled at parent level for ActionSheet
  }
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  padding: 8px 12px;
  gap: 8px;
}

.bubble-self {
  justify-content: flex-end;
}

.bubble-avatar {
  flex-shrink: 0;
}

.bubble-content {
  max-width: 65%;
  display: flex;
  flex-direction: column;
}

.content-self {
  align-items: flex-end;
}

.bubble-name {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.quote-block {
  background: rgba(0,0,0,0.05);
  border-left: 3px solid #07c160;
  padding: 6px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 12px;
  max-width: 100%;
  overflow: hidden;
}

.quote-name {
  color: #07c160;
  font-weight: 500;
}

.quote-text {
  color: #666;
}

.bubble-body {
  background: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  word-break: break-word;
  position: relative;
}

.bubble-self .bubble-body {
  background: #95ec69;
}

.recalled-text {
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.text-content {
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1989fa;
  text-decoration: none;
  font-size: 14px;
}

.bubble-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  padding: 0 4px;
}

.time-self {
  text-align: right;
}
</style>
