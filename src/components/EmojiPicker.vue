<template>
  <div class="emoji-picker">
    <div class="emoji-grid">
      <span
        v-for="emoji in emojis"
        :key="emoji"
        class="emoji-item"
        @click="$emit('select', emoji)"
      >{{ emoji }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ select: [emoji: string] }>()

const emojis = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','😗','😙','😚','🙂','🤗','🤔',
  '😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓',
  '😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰',
  '😱','😳','🤪','😵','😡','😠','🤬','😷','🤒','🤕','🤢','🤮','😇','🤠','🤡','🤥','😺','😸','😹','😻',
  '❤️','🧡','💛','💚','💙','💜','🖤','💔','❣️','💕','💞','💓','💗','💖','💝','👍','👎','👏','🙌','🤝',
  '💪','👋','✌️','🤞','🤟','🤘','👌','👈','👉','👆','👇','☝️','✋','🎉','🎊','🎈','🔥','⭐','🌟','✨',
  '⚡','💡','💤','💢','💣','💥','💦','💨','💫','🕳️','🎵','🎶','🌹','🌺','🌸','🌼','🌻','💐','🍀','🌿'
]
</script>

<style scoped>
.emoji-picker {
  background: #fff;
  border-top: 1px solid #eee;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  padding: 6px;
  cursor: pointer;
}

.emoji-item:active {
  background: #f0f0f0;
  border-radius: 4px;
}
</style>
