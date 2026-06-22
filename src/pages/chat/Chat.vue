<template>
  <div class="h-screen flex bg-[#0f172a] text-white overflow-hidden">

    <!-- ================= SIDEBAR ================= -->
    <ChatSidebar
      :users="userStore.users"
      :chats="chatStore.chats"
      :activeChat="chatStore.activeChat"
      :getOtherUser="getOtherUser"
      @open-chat="openChat"
      @open-user="openUser"
    />

    <!-- ================= CHAT AREA ================= -->
    <div
      v-if="chatStore.activeChat"
      class="flex-1 flex flex-col bg-[#0b1220] h-full overflow-hidden"
    >

      <!-- HEADER -->
      <ChatHeader
        :chat="chatStore.activeChat"
        :getOtherUser="getOtherUser"
        @back="chatStore.activeChat = null"
         @voice-call="callStore.startCall(getOtherUser(chatStore.activeChat)._id, 'audio')"
        @video-call="callStore.startCall(getOtherUser(chatStore.activeChat)._id, 'video')"
      />

      <!-- MESSAGES -->
        <div class="flex-1 overflow-y-auto relative min-h-0">

          <!-- EMPTY CHAT ANIMATION -->
          <StartHint
            v-if="showStartHint"
            :visible="true"
            title="Start Messaging 💬"
            subtitle="Send your first message to begin chat"
          />

          <!-- MESSAGE LIST -->
          <MessageList
            v-else
            :messages="messageStore.messages"
            :userId="authStore.user?._id"
            @preview="openPreview"
            @delete="handleDelete"
            
          />

        </div>

      <!-- INPUT -->
      <div class="bg-[#0b1220] border-t border-gray-800">
        <ChatInput
          v-model="message"
          @send="send"
          @file="handleFile"
          @contact="handleContact"
          @location="handleLocation"
          @audio="handleAudio"
          @camera="handleCamera"
        />
      </div>

    </div>

    <!-- EMPTY STATE -->
    <div
      v-else
      class="hidden md:flex flex-1 items-center justify-center text-gray-400"
    >
      Select a chat to start messaging
    </div>

    <!-- MOBILE TABBAR -->
    <div v-if="!chatStore.activeChat" class="md:hidden">
      <van-tabbar
        fixed
        route
        class="custom-tabbar"
        active-color="#22c55e"
        inactive-color="#94a3b8"
      >
        <van-tabbar-item icon="home-o" to="/home">Home</van-tabbar-item>
        <van-tabbar-item icon="contact-o" to="/contact">Contact</van-tabbar-item>
        <van-tabbar-item icon="user-o" to="/profile">Profile</van-tabbar-item>
        <van-tabbar-item icon="setting-o" to="/settings">Settings</van-tabbar-item>
      </van-tabbar>
    </div>

    <!-- MEDIA PREVIEW -->
    <MediaPreview
      :visible="previewVisible"
      :url="previewUrl"
      :type="previewType"
      @close="previewVisible = false"
    />



  </div>
</template>
<script setup>
import { ref, onMounted, nextTick,watch ,computed  } from "vue";

import ChatSidebar from "../../components/chat/ChatSidebar.vue";
import ChatHeader from "../../components/chat/ChatHeader.vue";
import MessageList from "../../components/chat/MessageList.vue";
import ChatInput from "../../components/chat/ChatInput.vue";
import MediaPreview from "../../components/chat/MediaPreview.vue";
import StartHint from "../../components/chat/StartChatHint.vue";
import { useCallStore } from "../../store/callStore";


import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useMessageStore } from "../../store/messageStore";
import { useUserStore } from "../../store/userStore";
import { useNotificationStore } from "../../store/notificationStore";

import { useRoute } from "vue-router";
import { useGroupStore } from "../../store/groupStore";

import socket from "../../socket/socket";
import api from "../../api/axios";

const chatStore = useChatStore();
const authStore = useAuthStore();
const messageStore = useMessageStore();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const route = useRoute();
const groupStore = useGroupStore();

const callStore = useCallStore();

/* ================= STATE ================= */
const message = ref("");
const hasSentFirstMessage = ref(false);


/* preview */
const previewVisible = ref(false);
const previewUrl = ref("");
const previewType = ref("");

/* ================= INIT ================= */
onMounted(async () => {
  if (!authStore.user) await authStore.getCurrentUser();

   callStore.setUser(authStore.user?._id);

  await userStore.getUsers();
  messageStore.initSocketListeners();
  await chatStore.getChats();

  await notificationStore.fetchNotifications();
  await notificationStore.markAllAsRead();


  socket.on("notification", (data) => {
    notificationStore.addNotification(data);
  });
});

watch(
  () => authStore.user,
  (user) => {
    if (user?._id) {
      callStore.setUser(user._id);
    }
  },
  { immediate: true }
);

/* ================= PREVIEW ================= */
const openPreview = (payload) => {
  console.log("PREVIEW CLICKED:", payload);

  previewUrl.value = payload.url;
  previewType.value = payload.type || "image";

  previewVisible.value = true;
};




const handleDelete = async (messageId) => {
   await messageStore.deleteMessage(messageId);
};








/* ================= OPEN CHAT ================= */
const openChat = async (chat) => {
  chatStore.activeChat = chat;

  socket.emit("join-chat", chat._id);

  await messageStore.getMessages(chat._id);

  await nextTick();

  hasSentFirstMessage.value = false;
};


const showStartHint = computed(() => {
  return (
    chatStore.activeChat &&
    Array.isArray(messageStore.messages) &&
    messageStore.messages.length === 0
  );
});










/* ================= OPEN USER ================= */
const openUser = async (user) => {
  const res = await api.post("/chats", { userId: user._id });

  chatStore.activeChat = res.data.chat;

  socket.emit("join-chat", res.data.chat._id);

  await messageStore.getMessages(res.data.chat._id);
  await chatStore.getChats();
};

/* ================= SEND ================= */
const send = async () => {
  if (!message.value.trim()) return;

  await messageStore.sendMessage(
    chatStore.activeChat._id,
    message.value
  );

  message.value = "";
};

/* ================= FILE ================= */
const handleFile = async (payload) => {
  let type = "file";

  if (payload.mime?.startsWith("image/")) type = "image";
  else if (payload.mime?.startsWith("video/")) type = "video";
  else if (payload.mime?.startsWith("audio/")) type = "audio";

  await messageStore.sendMessage(
    chatStore.activeChat._id,
    payload.url,
    type,
    payload.url
  );
};

/* ================= CONTACT ================= */
const handleContact = async (contact) => {
  await messageStore.sendMessage(
    chatStore.activeChat._id,
    JSON.stringify(contact),
    "contact"
  );
};

const handleLocation = () => {};
const handleAudio = () => {};
const handleCamera = () => {};

/* ================= OTHER USER ================= */
const getOtherUser = (chat) => {
  return chat?.participants?.find(
    (u) => u._id !== authStore.user?._id
  );
};
</script>
<style>
.custom-tabbar {
  background: rgba(11, 18, 32, 0.92) !important;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-top: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 -10px 25px rgba(0,0,0,0.45);
  height: 64px;
  padding-bottom: 4px;
}

.custom-tabbar .van-tabbar-item {
  font-size: 11px;
}

.custom-tabbar .van-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.custom-tabbar .van-tabbar-item--active {
  background: transparent !important;
  color: #22c55e !important;
}
</style>