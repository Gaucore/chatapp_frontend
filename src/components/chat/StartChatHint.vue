<template>
  <transition name="fade-scale">
    <div
      v-if="visible"
      class="absolute inset-0 flex items-center justify-center bg-[#0b1220]/40 backdrop-blur-sm"
    >
      <div class="text-center px-6 py-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-lg">

        <div class="text-5xl mb-3 animate-bounce-slow">
          💬
        </div>

        <h2 class="text-white text-lg font-semibold">
          {{ title }}
        </h2>

        <p class="text-gray-400 text-sm mt-1">
          {{ subtitle }}
        </p>

      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: Boolean,
  title: {
    type: String,
    default: "Start Messaging"
  },
  subtitle: {
    type: String,
    default: "Send your first message to begin chat"
  }
});
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.animate-bounce-slow {
  animation: bounceSlow 1.4s infinite;
}

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>