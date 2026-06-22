<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900 p-4">

    <!-- CARD -->
    <div class="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white">

      <!-- TOP BAR -->
      <div class="flex justify-between items-center mb-4">

        <!-- BACK -->
        <div class="text-gray-300 text-sm cursor-pointer hover:text-white">
          ← Back
        </div>

        <!-- VERSION BADGE -->
        <div class="px-3 py-1 text-[11px] rounded-full bg-white/10 border border-white/20 text-gray-200 backdrop-blur-md">
          v{{ serverVersion }}
        </div>

      </div>

      <!-- TITLE -->
      <h1 class="text-2xl font-bold">Sign in to your Account</h1>
      <p class="text-sm text-gray-300 mt-1">Sign in to continue</p>

      <!-- FORM -->
      <van-form class="mt-6" @submit="onSubmit">

        <!-- EMAIL -->
        <van-field
          v-model="email"
          placeholder="Email"
          left-icon="envelop-o"
          class="!bg-white/10 !rounded-xl mb-4"
          clearable
        />

        <!-- PASSWORD -->
        <van-field
          v-model="password"
          type="password"
          placeholder="Password"
          left-icon="lock"
          class="!bg-white/10 !rounded-xl mb-2"
          clearable
        />

        <!-- FORGOT -->
        <div class="text-right text-xs text-pink-400 mb-4">
          Forgot Password?
        </div>

        <!-- BUTTON -->
        <van-button
          block
          round
          class="!bg-pink-500 !border-0 !text-white font-semibold"
          native-type="submit"
        >
          Login
        </van-button>

      </van-form>

      <!-- OR -->
      <div class="text-center text-gray-300 my-4 text-xs">
        or login with
      </div>

      <!-- SOCIAL -->
      <div class="flex gap-3">
        <button class="flex-1 bg-white/10 py-2 rounded-xl text-sm">
          Facebook
        </button>
        <button class="flex-1 bg-white/10 py-2 rounded-xl text-sm">
          Google
        </button>
      </div>

      <!-- REGISTER -->
      <div class="text-center mt-5 text-sm text-gray-300">
        Don’t have account?
        <router-link to="/register" class="text-pink-400 font-semibold">
          Register
        </router-link>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "vue-router";
import { useCallStore } from "../../store/callStore";
import pkg from "../../../package.json";

const email = ref("");
const password = ref("");

// ✅ VERSION FROM PACKAGE.JSON
const serverVersion = ref(pkg.version);

const auth = useAuthStore();
const router = useRouter();
const callStore = useCallStore();

const onSubmit = async () => {
  await auth.login(email.value, password.value);

  const user = auth.user;

  if (user?._id) {
    callStore.setUser(user._id);
  }

  router.push("/home");
};
</script>

<style scoped>
/* FIX VANT INPUT TEXT COLOR */
:deep(.van-field__control) {
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}

/* placeholder color */
:deep(.van-field__placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* label/icon color */
:deep(.van-field__label),
:deep(.van-field__left-icon) {
  color: #fff !important;
}
</style>