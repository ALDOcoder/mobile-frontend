<template>
  <van-overlay :show="visible" @click="visible = false">
    <div class="image-preview" @click.stop>
      <div class="preview-close" @click="visible = false">
        <van-icon name="cross" size="24" color="#fff" />
      </div>
      <img :src="url" class="preview-img" alt="preview" />
    </div>
  </van-overlay>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  url: string
}>()

const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>()

const visible = ref(props.modelValue)

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })
</script>

<style scoped>
.image-preview {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-close {
  position: absolute;
  top: 24px;
  right: 16px;
  z-index: 1;
}

.preview-img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
}
</style>
