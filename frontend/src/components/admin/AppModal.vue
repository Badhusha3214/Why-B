<script setup lang="ts">
defineProps<{
  title?: string
  onClose?: () => void
}>()
const emit = defineEmits(['close'])
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="emit('close')" style="background:none; border:none; color:white; font-size:1.3rem; cursor:pointer; line-height:1;">×</button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
