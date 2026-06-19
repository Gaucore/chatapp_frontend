<template>
  <div class="h-screen bg-gradient-to-b from-[#070b14] via-[#0b1220] to-[#0b1220] text-white flex flex-col">

    <!-- NAVBAR -->
    <van-nav-bar
      title="Profile"
      left-arrow
      @click-left="$router.back()"
      class="profile-nav"
      fixed
    />

    <!-- MAIN -->
    <div class="flex-1 overflow-y-auto p-4 flex justify-center mt-2">

      <div class="w-full max-w-2xl space-y-5">

        <!-- PROFILE CARD -->
        <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center">

          <!-- AVATAR -->
          <div class="relative">

            <img
              :src="profile.user?.avatar || defaultAvatar"
              class="w-32 h-32 rounded-full border-4 border-[#22c55e] object-cover shadow-lg"
            />

            <!-- CAMERA BUTTON (FIXED + MODERN) -->
            <label
              class="absolute bottom-2 right-2 w-10 h-10 flex items-center justify-center 
                     rounded-full bg-gradient-to-r from-green-400 to-green-600 
                     shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition"
            >
              <van-icon name="photograph" class="text-white text-lg" />

              <input type="file" class="hidden" @change="onAvatarChange" />
            </label>

          </div>

          <h2 class="mt-4 text-xl font-semibold tracking-wide">
            {{ profile.user?.name || "User Name" }}
          </h2>

          <p class="text-gray-400 text-sm mt-1">
            Tap camera icon to update your photo
          </p>
        </div>

        <!-- PROFILE INFO -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg overflow-hidden">

          <div class="px-5 py-4 border-b border-white/10 text-gray-300 text-sm font-medium">
            Profile Information
          </div>

          <div class="p-4 space-y-4">

            <div>
              <p class="text-gray-400 text-xs mb-1">Name</p>
              <input
                v-model="name"
                placeholder="Enter your name"
                class="w-full bg-transparent border-b border-gray-700 focus:border-green-400 outline-none py-2 transition"
              />
            </div>

            <div>
              <p class="text-gray-400 text-xs mb-1">Bio</p>
              <input
                v-model="bio"
                placeholder="Write something about you..."
                class="w-full bg-transparent border-b border-gray-700 focus:border-green-400 outline-none py-2 transition"
              />
            </div>

          </div>

          <div class="p-4">
            <button
              @click="update"
              class="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-3 rounded-2xl font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Update Profile
            </button>
          </div>
        </div>

        <!-- SECURITY -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg overflow-hidden">

          <div class="px-5 py-4 border-b border-white/10 text-gray-300 text-sm font-medium">
            Security
          </div>

          <div class="p-4 space-y-6">

            <!-- CURRENT PASSWORD -->
            <div>
              <p class="text-gray-400 text-xs mb-2">Current Password</p>

              <div class="flex items-center border-b border-gray-700 focus-within:border-red-400 transition py-2">

                <input
                  :type="showCurrentPassword ? 'text' : 'password'"
                  v-model="currentPassword"
                  placeholder="••••••••"
                  class="flex-1 bg-transparent outline-none text-white"
                />

                <van-icon
                  :name="showCurrentPassword ? 'eye-o' : 'closed-eye'"
                  class="text-gray-300 cursor-pointer text-lg ml-2"
                  @click="showCurrentPassword = !showCurrentPassword"
                />
              </div>
            </div>

            <!-- NEW PASSWORD -->
            <div>
              <p class="text-gray-400 text-xs mb-2">New Password</p>

              <div class="flex items-center border-b border-gray-700 focus-within:border-red-400 transition py-2">

                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  v-model="newPassword"
                  placeholder="••••••••"
                  class="flex-1 bg-transparent outline-none text-white"
                />

                <van-icon
                  :name="showNewPassword ? 'eye-o' : 'closed-eye'"
                  class="text-gray-300 cursor-pointer text-lg ml-2"
                  @click="showNewPassword = !showNewPassword"
                />
              </div>
            </div>

          </div>

          <div class="p-4">
            <button
              @click="changePass"
              class="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-2xl font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Change Password
            </button>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useProfileStore } from "../../store/profileStore";

const profile = useProfileStore();

const name = ref("");
const bio = ref("");
const currentPassword = ref("");
const newPassword = ref("");

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);

const defaultAvatar = "https://i.pravatar.cc/150";

onMounted(async () => {
  await profile.fetchProfile();
  name.value = profile.user?.name || "";
  bio.value = profile.user?.bio || "";
});

const update = async () => {
  await profile.updateProfile({
    name: name.value,
    bio: bio.value,
  });
};

const onAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await profile.uploadAvatar(file);
};

const changePass = async () => {
  await profile.changePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  });

  currentPassword.value = "";
  newPassword.value = "";
};
</script>

<style>
.profile-nav {
  background: rgba(17, 24, 39, 0.9) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.profile-nav .van-nav-bar__title {
  color: white !important;
  font-weight: 600;
  font-size: 16px;
}

.profile-nav .van-icon {
  color: white !important;
}

@media (min-width: 768px) {
  .profile-nav {
    display: none !important;
  }
}
</style>