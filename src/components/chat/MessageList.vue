<template>
  <div class="flex-1 overflow-y-auto overflow-x-visible p-4 space-y-3 pb-24">
    <MessageBubble
      v-for="msg in messages"
      :key="msg._id"
      :msg="msg"
      :userId="userId"
      @preview="$emit('preview', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup>
import MessageBubble from "./MessageBubble.vue";

defineProps({
  messages: Array,
  userId: String
});

defineEmits(["preview","delete"]);
</script>