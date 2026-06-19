<template>
  <div class="h-screen flex bg-[#0f172a] text-white">

    <!-- =======================
         SIDEBAR
    ======================= -->
    <ChatSidebar
      :users="userStore.users"
      :chats="chatStore.chats"
      :activeChat="chatStore.activeChat"
      :getOtherUser="getOtherUser"
      @open-chat="openChat"
      @open-user="openUser"
    />

    <!-- =======================
         CHAT WINDOW
    ======================= -->
    <div
      v-if="chatStore.activeChat"
      class="flex-1 flex flex-col bg-[#0b1220]"
    >
      <ChatHeader
        :chat="chatStore.activeChat"
        :getOtherUser="getOtherUser"
        @back="chatStore.activeChat = null"
      />

      <MessageList
        :messages="messageStore.messages"
        :userId="authStore.user?._id"
      />

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

    <!-- =======================
         EMPTY STATE (DESKTOP ONLY)
    ======================= -->
    <div
      v-else
      class="hidden md:flex flex-1 items-center justify-center text-gray-400"
    >
      Select a chat to start messaging
    </div>

    <!-- =======================
         MOBILE TABBAR (ONLY NO CHAT)
    ======================= -->
    <van-tabbar
      v-if="!chatStore.activeChat"
      class="md:hidden"
      route
      fixed
    >
      <van-tabbar-item icon="home-o" to="/home">
        Home
      </van-tabbar-item>

      <van-tabbar-item icon="user-o" to="/profile">
        Profile
      </van-tabbar-item>

      <van-tabbar-item icon="setting-o" to="/settings">
        Settings
      </van-tabbar-item>
    </van-tabbar>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import ChatSidebar from "../../components/chat/ChatSidebar.vue";
import ChatHeader from "../../components/chat/ChatHeader.vue";
import MessageList from "../../components/chat/MessageList.vue";
import ChatInput from "../../components/chat/ChatInput.vue";

import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useMessageStore } from "../../store/messageStore";
import { useUserStore } from "../../store/userStore";

import socket from "../../socket/socket";
import api from "../../api/axios";

const chatStore = useChatStore();
const authStore = useAuthStore();
const messageStore = useMessageStore();
const userStore = useUserStore();

const message = ref("");

onMounted(async () => {
  if (!authStore.user) {
    await authStore.getCurrentUser();
  }

  await userStore.getUsers();
  messageStore.initSocketListeners();
  await chatStore.getChats();
});

/* =======================
   OPEN CHAT FROM USER
======================= */
const openUser = async (user) => {
  try {
    const res = await api.post("/chats", {
      userId: user._id,
    });

    chatStore.activeChat = res.data.chat;

    socket.emit("join-chat", res.data.chat._id);

    await messageStore.getMessages(res.data.chat._id);

    await chatStore.getChats();
  } catch (err) {
    console.log("OPEN USER ERROR:", err.response?.data);
  }
};

/* =======================
   OPEN EXISTING CHAT
======================= */
const openChat = async (chat) => {
  chatStore.activeChat = chat;

  socket.emit("join-chat", chat._id);

  await messageStore.getMessages(chat._id);
};

/* =======================
   SEND MESSAGE
======================= */
const send = async () => {
  if (!message.value.trim()) return;

  await messageStore.sendMessage(
    chatStore.activeChat._id,
    message.value
  );

  message.value = "";
};

/* =======================
   GET OTHER USER
======================= */
const getOtherUser = (chat) => {
  if (!chat?.participants) return null;

  return (
    chat.participants.find(
      (user) => user._id !== authStore.user?._id
    ) || chat.participants[0]
  );
};

/* =======================
   HANDLERS
======================= */
const handleFile = (file) => console.log("FILE:", file);
const handleContact = () => console.log("CONTACT CLICK");
const handleLocation = () => console.log("LOCATION CLICK");
const handleAudio = (file) => console.log("AUDIO:", file);
const handleCamera = (file) => console.log("CAMERA:", file);
</script>