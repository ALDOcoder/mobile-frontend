<template>
  <div class="message-input">
    <!-- 引用预览 -->
    <div class="quote-preview" v-if="quoteMessage">
      <span>{{ quoteMessage.senderName }}：{{ quoteMessage.content }}</span>
      <van-icon name="cross" size="14" @click="$emit('cancelQuote')" />
    </div>

    <div class="input-bar">
      <div class="input-left" @click="showEmoji = !showEmoji">
        <van-icon name="smile-o" size="22" />
      </div>
      <input
        ref="inputRef"
        v-model="text"
        class="text-input"
        placeholder="输入消息..."
        @keydown.enter="onSend"
      />
      <div class="input-right" @click="showMore = !showMore">
        <van-icon name="add-o" size="22" />
      </div>
      <div class="send-btn" v-if="text.trim()" @click="onSend">
        <span>发送</span>
      </div>
    </div>

    <!-- 表情面板 -->
    <div v-if="showEmoji">
      <EmojiPicker @select="onEmojiSelect" />
    </div>

    <!-- 更多面板 -->
    <div v-if="showMore" class="more-panel">
      <div class="more-item" @click="triggerImage">
        <van-icon name="photo-o" size="24" />
        <span>图片</span>
        <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="onFileChange($event, 'image')" />
      </div>
      <div class="more-item" @click="triggerFile">
        <van-icon name="description" size="24" />
        <span>文件</span>
        <input ref="fileInput" type="file" style="display:none" @change="onFileChange($event, 'file')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { showToast } from 'vant'
import EmojiPicker from './EmojiPicker.vue'
import type { Message } from '@/stores/chat'

const props = defineProps<{
  quoteMessage?: Message | null
}>()

const emit = defineEmits<{
  send: [data: { content: string; messageType: string; fileUrl?: string; fileName?: string; fileSize?: number; quoteMessageId?: string; quoteSenderName?: string; quoteContent?: string }]
  cancelQuote: []
}>()

const text = ref('')
const showEmoji = ref(false)
const showMore = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function onEmojiSelect(emoji: string) {
  text.value += emoji
  showEmoji.value = false
  nextTick(() => inputRef.value?.focus())
}

function onSend(e?: KeyboardEvent) {
  if (e) e.preventDefault()
  if (!text.value.trim()) return
  
  const content = text.value.trim()
  text.value = ''
  showEmoji.value = false
  showMore.value = false
  nextTick(() => inputRef.value?.focus())

  emit('send', {
    content,
    messageType: 'text',
    quoteMessageId: props.quoteMessage?.id,
    quoteSenderName: props.quoteMessage?.senderName,
    quoteContent: props.quoteMessage?.content
  })
}

function triggerImage() {
  imageInput.value?.click()
  showMore.value = false
}

function triggerFile() {
  fileInput.value?.click()
  showMore.value = false
}

async function onFileChange(event: Event, type: 'image' | 'file') {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024
  if (file.size > maxSize) {
    showToast(type === 'image' ? '图片不能超过10MB' : '文件不能超过50MB')
    return
  }

  // Upload will be handled by parent via emit with FormData
  emit('send', {
    content: `[${type === 'image' ? '图片' : '文件'}]`,
    messageType: type,
    fileUrl: '', // parent will fill after upload
    fileName: file.name,
    fileSize: file.size,
    quoteMessageId: props.quoteMessage?.id,
    quoteSenderName: props.quoteMessage?.senderName,
    quoteContent: props.quoteMessage?.content
  })
  
  // Also emit raw file for parent to upload
  ;(window as any).__pendingFile = file
  ;(window as any).__pendingFileType = type

  target.value = ''
}

defineExpose({ clearInput: () => { text.value = '' } })
</script>

<style scoped>
.message-input {
  background: #f7f7f7;
  border-top: 1px solid #eee;
}

.quote-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(7, 193, 96, 0.1);
  font-size: 12px;
  color: #666;
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.text-input {
  flex: 1;
  border: none;
  outline: none;
  background: #fff;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 15px;
  line-height: 1.4;
}

.input-left, .input-right {
  color: #666;
  padding: 4px;
  cursor: pointer;
}

.send-btn {
  background: #07c160;
  color: #fff;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
}

.more-panel {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: #fff;
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}
</style>
