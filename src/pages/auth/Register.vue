<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900 p-4">

    <div class="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white">

      <h1 class="text-2xl font-bold">Register</h1>
      <p class="text-sm text-gray-300 mt-1">Create your account</p>

      <van-form class="mt-6" @submit="onSubmit">

        <van-field
          v-model="name"
          placeholder="Name"
          left-icon="contact"
          class="!bg-white/10 !rounded-xl mb-4"
          input-style="color:white"
          style="color:white"
          clearable
        />

        

        <van-field
          v-model="email"
          placeholder="Email"
          left-icon="envelop-o"
          class="!bg-white/10 !rounded-xl mb-4"
          style="color:white"
          clearable
        />

        <van-field
          v-model="password"
          type="password"
          placeholder="Password"
          left-icon="lock"
          class="!bg-white/10 !rounded-xl mb-4"
          style="color:white"
          clearable
        />

        <van-button
          block
          round
          class="!bg-pink-500 !border-0 !text-white"
          native-type="submit"
        >
          Register
        </van-button>

      </van-form>

      <div class="text-center mt-5 text-sm text-gray-300">
        Already have account?
        <router-link to="/login" class="text-pink-400 font-semibold">
          Login
        </router-link>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");

const auth = useAuthStore();
const router = useRouter();

const onSubmit = async () => {
  await auth.register({
    name: name.value,
    email: email.value,
    password: password.value,
  });

  router.push("/login");
};
</script>


<style scoped>
/* ✅ FIX VANT INPUT TEXT COLOR */
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