<template>
  <div class="h-screen bg-[#0f172a] text-white p-4">

    <!-- MOBILE NAVBAR -->
    <van-nav-bar
      class="md:hidden"
      title="Notifications"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <span
          v-if="notificationStore.notifications.length > 0"
          class="text-red-400 text-sm font-medium cursor-pointer"
          @click="clearAll"
        >
          Clear All
        </span>
      </template>
    </van-nav-bar>

    <!-- DESKTOP HEADER -->
    <div class="hidden md:flex justify-between items-center mb-4">
      <div class="text-2xl font-bold">
        🔔 Notifications
      </div>

      <button
        v-if="notificationStore.notifications.length > 0"
        class="text-red-400 text-sm hover:underline"
        @click="clearAll"
      >
        Clear All
      </button>
    </div>

    <!-- EMPTY STATE -->
    <div
      v-if="notificationStore.notifications.length === 0"
      class="text-gray-400 text-center mt-10"
    >
      No notifications
    </div>

    <!-- NOTIFICATIONS LIST -->
    <div class="space-y-3 mt-4 md:mt-0">

      <div
        v-for="n in notificationStore.notifications"
        :key="n._id"
        class="p-3 bg-[#111827] border border-gray-700 rounded-lg flex items-center gap-3 cursor-pointer"
        @click="markRead(n)"
      >

        <!-- Avatar -->
        <img
          v-if="n.sender?.avatar"
          :src="n.sender.avatar"
          class="w-10 h-10 rounded-full object-cover"
        />

        <!-- Info -->
        <div class="flex flex-col">
          <p class="font-semibold">
            {{ n.sender?.name || "System" }}
          </p>

          <p class="text-gray-400 text-sm">
            {{ n.message }}
          </p>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useNotificationStore } from "../../store/notificationStore";
import api from "../../api/axios";

const notificationStore = useNotificationStore();

onMounted(async () => {
  await notificationStore.fetchNotifications();
});

/**
 * MARK SINGLE READ
 */
const markRead = async (n) => {
  try {
    await api.put(`/notifications/${n._id}`);
    notificationStore.markAsRead(n._id);
  } catch (error) {
    console.log(error);
  }
};

/**
 * CLEAR ALL NOTIFICATIONS
 */
const clearAll = async () => {
  try {
    await notificationStore.clearAll();
  } catch (error) {
    console.log(error);
  }
};
</script>

<style scoped>
:deep(.van-nav-bar) {
  background: #111827 !important;
}

:deep(.van-nav-bar__content) {
  background: #111827 !important;
}

:deep(.van-nav-bar__title) {
  color: white !important;
}

:deep(.van-icon) {
  color: white !important;
}

:deep(.van-nav-bar__right) {
  color: #f87171 !important;
}

:deep(.van-hairline--bottom::after) {
  border-bottom: 1px solid #374151 !important;
}
</style>