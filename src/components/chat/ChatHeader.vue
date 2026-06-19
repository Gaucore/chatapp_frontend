<template>
  <van-nav-bar
    class="chat-navbar"
    @click-left="$emit('back')"
  >
    <!-- CUSTOM BACK BUTTON -->
    <template #left>
      <van-icon
        name="arrow-left"
        size="22"
        class="back-icon"
      />
    </template>

    <!-- TITLE -->
    <template #title>
      <div class="flex items-center gap-2">
        <img
          :src="
            isGroup
              ? (chat?.avatar || defaultAvatar)
              : (otherUser?.avatar || defaultAvatar)
          "
          class="w-9 h-9 rounded-full object-cover"
        />

        <div class="flex flex-col items-start">
          <template v-if="isGroup">
            <span class="text-white font-medium">
              {{ chat?.name }}
            </span>

            <span class="text-xs text-gray-400">
              {{ groupMembersCount }} members
            </span>
          </template>

          <template v-else>
            <span class="text-white font-medium">
              {{ otherUser?.name || "Chat" }}
            </span>

            <span
              class="text-xs"
              :class="
                isOnline(otherUser?._id)
                  ? 'text-green-400'
                  : 'text-gray-400'
              "
            >
              {{
                isOnline(otherUser?._id)
                  ? "Online"
                  : "Offline"
              }}
            </span>
          </template>
        </div>
      </div>
    </template>

    <!-- CALL BUTTONS -->
    <template #right v-if="!isGroup && otherUser">

      <div class="call-actions">

        <!-- AUDIO -->
        <div
          class="action-btn"
          @click="startAudioCall"
        >
          <van-icon
            name="phone-circle-o"
            size="24"
          />
        </div>

        <!-- VIDEO -->
        <div
          class="action-btn"
          @click="startVideoCall"
        >
          <van-icon
            name="video-o"
            size="24"
          />
        </div>

      </div>

    </template>

  </van-nav-bar>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { useCallStore } from "../../store/callStore";

const authStore = useAuthStore();
const chatStore = useChatStore();
const callStore = useCallStore();

const props = defineProps({
  chat: Object,
});

const defaultAvatar =
  "https://ui-avatars.com/api/?background=random&name=Group";

const otherUser = computed(() => {
  if (!props.chat?.participants) return null;

  return props.chat.participants.find(
    (user) => user._id !== authStore.user?._id
  );
});

const isGroup = computed(() => {
  return (
    props.chat &&
    !props.chat.participants &&
    props.chat.members
  );
});

const groupMembersCount = computed(() => {
  return props.chat?.members?.length || 0;
});

const isOnline = (userId) => {
  return chatStore.onlineUsers.includes(userId);
};

const startAudioCall = () => {
  if (!otherUser.value?._id) return;

   callStore.chatId = props.chat._id;
    callStore.callUser = {
    _id: otherUser.value._id,
    name: otherUser.value.name,
    avatar: otherUser.value.avatar,
  };

  callStore.startCall(
    otherUser.value._id,
    "audio"
  );
};

const startVideoCall = () => {
  if (!otherUser.value?._id) return;

   callStore.chatId = props.chat._id;

    callStore.callUser = {
    _id: otherUser.value._id,
    name: otherUser.value.name,
    avatar: otherUser.value.avatar,
  };

  callStore.startCall(
    otherUser.value._id,
    "video"
  );
};
</script>

<style>
.chat-navbar .van-nav-bar__content {
  background: #111827 !important;
}

.chat-navbar .van-nav-bar__title {
  color: white !important;
}

.chat-navbar {
  border-bottom: 1px solid #1f2937;
}

.back-icon {
  color: white;
}

/* CALL BUTTON CONTAINER */
.call-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ROUND BUTTON */
.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.15);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: all .25s ease;
}

.action-btn .van-icon {
  color: #22c55e !important;
}

.action-btn:hover {
  transform: scale(1.1);
  background: rgba(34, 197, 94, 0.25);
}
</style>