<template>
  <div v-if="file" class="overlay">

    <div class="box">

      <!-- HEADER -->
      <div class="header">
        <div class="icon">📎</div>
        <div class="title">File Ready</div>
      </div>

      <!-- FILE INFO -->
      <div class="file-card">
        <div class="file-icon">📄</div>

        <div class="details">
          <p class="name">{{ file.name }}</p>
          <p class="size">
            {{ (file.size / 1024).toFixed(2) }} KB
          </p>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="actions">

        <button class="btn cancel" @click="$emit('cancel')">
          Cancel
        </button>

        <button class="btn send" @click="$emit('send', file)">
          Send
        </button>

      </div>

    </div>

  </div>
</template>

<script setup>
defineProps({
  file: Object,
});
</script>

<style scoped>
/* BACKDROP */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* MAIN BOX */
.box {
  width: 340px;
  background: #0b1220;
  border: 1px solid #1f2937;
  border-radius: 16px;
  padding: 16px;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

/* HEADER */
.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.icon {
  width: 34px;
  height: 34px;
  background: #1f2937;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
}

/* FILE CARD */
.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #111827;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #1f2937;
}

.file-icon {
  font-size: 22px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  border-radius: 10px;
}

.details {
  flex: 1;
}

.name {
  font-size: 13px;
  font-weight: 500;
  color: #f3f4f6;
  word-break: break-all;
}

.size {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

/* ACTIONS */
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

.cancel {
  background: #1f2937;
  color: #e5e7eb;
}

.cancel:hover {
  background: #374151;
}

.send {
  background: #22c55e;
  color: black;
  font-weight: 600;
}

.send:hover {
  background: #16a34a;
}
</style>