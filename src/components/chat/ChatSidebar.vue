<template>
  <div
    class="w-full md:w-1/3 bg-[#111827] border-r border-gray-800 flex flex-col"
    :class="activeChat ? 'hidden md:flex' : 'flex'"
  >
    <!-- HEADER -->
    <div class="p-4 border-b border-gray-800 flex items-center justify-between">

      <div class="text-xl font-bold flex items-center gap-3">
        💬 Messages

        <!-- NOTIFICATION ICON -->
        <div
          class="relative cursor-pointer"
          @click="$router.push('/notifications')"
        >
          <span>🔔</span>

          <span
            v-if="notificationStore.unreadCount > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full"
          >
            {{ notificationStore.unreadCount }}
          </span>
        </div>
      </div>

      <!-- MENU -->
      <div class="relative">

        <div
          class="w-8 h-8 flex flex-col items-center justify-center gap-1 cursor-pointer rounded-full hover:bg-gray-800"
          @click="showMenu = !showMenu"
        >
          <span class="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span class="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span class="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
        </div>

        <div
          v-if="showMenu"
          class="absolute right-0 mt-2 w-44 rounded-xl shadow-xl border border-gray-700 z-50"
          style="background:#111827;"
        >
          <div class="py-1">

            <div class="px-4 py-2 text-sm hover:bg-gray-800 cursor-pointer"  @click="openGroups">
              New group
            </div>

            <div class="px-4 py-2 text-sm hover:bg-gray-800 cursor-pointer" @click="profile">
              Profile
            </div>

            <div class="px-4 py-2 text-sm hover:bg-gray-800 cursor-pointer">
              Settings
            </div>

            <div class="border-t border-gray-700 my-1"></div>

            <div
              class="px-4 py-2 text-sm text-red-400 hover:bg-gray-800 cursor-pointer"
              @click="logout"
            >
              Log out
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- SEARCH -->
    <div class="p-3">
      <input
        v-model="search"
        placeholder="Search users..."
        class="w-full px-4 py-2 rounded-full bg-gray-800 text-white outline-none"
      />
    </div>

    <!-- USERS LIST -->
    <div class="flex-1 overflow-y-auto">

      <div
        v-for="user in filteredUsers"
        :key="user._id"
        @click="emit('open-user', user)"
        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 cursor-pointer"
      >

        <!-- AVATAR (FIXED) -->
        <div class="relative w-10 h-10">

          <img
            :src="user.avatar && user.avatar.trim() !== '' 
              ? user.avatar 
              : 'https://i.pravatar.cc/150'"
            class="w-10 h-10 rounded-full object-cover border border-gray-700"
          />

          <!-- ONLINE DOT -->
          <span
            class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black"
            :class="isOnline(user) ? 'bg-green-500' : 'bg-gray-500'"
          ></span>

        </div>

        <!-- INFO -->
        <div class="flex flex-col">
          <p class="text-white">{{ user.name }}</p>
          <p
            class="text-xs"
            :class="isOnline(user) ? 'text-green-400' : 'text-gray-400'"
          >
            {{ isOnline(user) ? 'Online' : 'Offline' }}
          </p>
        </div>

      </div>

      <div
        v-if="filteredUsers.length === 0"
        class="text-center text-gray-400 p-5"
      >
        No user found
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "vue-router";
import { useNotificationStore } from "../../store/notificationStore";



const notificationStore = useNotificationStore();
const router = useRouter();

const chatStore = useChatStore();
const authStore = useAuthStore();

const props = defineProps({
  users: { type: Array, default: () => [] },
  activeChat: Object,
});

const emit = defineEmits(["open-user"]);

const search = ref("");
const showMenu = ref(false);

// ONLINE CHECK
const isOnline = (user) => {
  return user.isOnline || chatStore.onlineUsers.includes(user._id);
};

// FILTER USERS
const filteredUsers = computed(() => {
  return props.users.filter((user) =>
    user.name?.toLowerCase().includes(search.value.toLowerCase())
  );
});

// LOGOUT
const logout = async () => {
  showMenu.value = false;
  localStorage.removeItem("token");
  authStore.user = null;
  router.push("/login");
};

const profile =  async () =>{
  showMenu.value=false;
  router.push("/profile");

}




const openGroups = () => {
  showMenu.value = false;
  router.push("/groups");
};


// OUTSIDE CLICK
const handleClickOutside = (e) => {
  if (!e.target.closest(".relative")) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>