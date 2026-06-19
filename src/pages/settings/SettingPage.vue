<template>
  <div :class="themeStore.darkMode ? darkClass : lightClass"
       class="h-screen flex flex-col transition-all duration-300">

    <!-- NAVBAR -->
    <van-nav-bar
      title="Settings"
      left-arrow
      @click-left="$router.back()"
      class="settings-nav"
      fixed
    />

    <!-- MAIN -->
    <div class="flex-1 overflow-y-auto p-4 flex justify-center mt-16">

      <div class="w-full max-w-2xl space-y-5">

        <!-- PROFILE HEADER -->
        <div
          class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-center gap-4 cursor-pointer"
          @click="$router.push('/profile')"
        >

          <img
            v-if="profile.user?.avatar"
            :src="profile.user.avatar"
            class="w-16 h-16 rounded-full border-2 border-green-400 object-cover"
          />

          <div
            v-else
            class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs border border-gray-600"
          >
            No Image
          </div>

          <div class="flex-1">
            <h2 class="text-lg font-semibold">
              {{ profile.user?.name || "User Name" }}
            </h2>
            <p class="text-gray-400 text-xs">
              {{ profile.user?.email || "No Email" }}
            </p>
          </div>

          <van-icon name="arrow" />
        </div>

        <!-- ACCOUNT -->
        <div class="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">

          <div class="px-5 py-4 text-gray-300 text-sm border-b border-white/10">
            Account
          </div>

          <div class="divide-y divide-gray-800">

            <div class="flex justify-between px-5 py-4 cursor-pointer"
                 @click="$router.push('/profile')">
              <span>Profile</span>
              <van-icon name="arrow" />
            </div>

            <div class="flex justify-between px-5 py-4 cursor-pointer">
              <span>Change Password</span>
              <van-icon name="arrow" />
            </div>

          </div>
        </div>

        <!-- APP SETTINGS -->
        <div class="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">

          <div class="px-5 py-4 text-gray-300 text-sm border-b border-white/10">
            App Settings
          </div>

          <div class="divide-y divide-gray-800">

            <!-- DARK MODE -->
            <div class="flex justify-between items-center px-5 py-4">
              <span>Dark Mode</span>
              <van-switch v-model="themeStore.darkMode" />
            </div>

            <!-- NOTIFICATIONS -->
            <div class="flex justify-between items-center px-5 py-4">
              <span>Notifications</span>
              <van-switch v-model="themeStore.notifications" />
            </div>

          </div>
        </div>

        <!-- LOGOUT -->
        <button class="w-full bg-gradient-to-r from-red-500 to-pink-500 py-3 rounded-2xl font-semibold">
          Logout
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useProfileStore } from "../../store/profileStore";
import { useThemeStore } from "../../store/themeStore";

/* STORES */
const profile = useProfileStore();
const themeStore = useThemeStore();

/* THEMES */
const darkClass =
  "bg-gradient-to-b from-[#070b14] via-[#0b1220] to-[#0b1220] text-white";

const lightClass =
  "bg-gray-100 text-black";

/* LOAD PROFILE */
onMounted(async () => {
  await profile.fetchProfile();
});
</script>

<style>
.settings-nav {
  background: rgba(17, 24, 39, 0.9) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.settings-nav .van-nav-bar__title {
  color: white !important;
  font-weight: 600;
  font-size: 16px;
}
</style>