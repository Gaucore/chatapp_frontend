<template>
  <div class="h-screen bg-[#0b1220] text-white flex flex-col">

    <!-- NAV -->
    <van-nav-bar
      title="Create Group"
      left-arrow
      @click-left="$router.back()"
      fixed
    />

    <div class="flex-1 overflow-y-auto p-4 space-y-4 mt-14">

      <!-- GROUP INFO -->
      <input
        v-model="name"
        placeholder="Group Name"
        class="w-full p-3 bg-white/5 rounded-xl border border-gray-700"
      />

      <textarea
        v-model="description"
        placeholder="Description"
        class="w-full p-3 bg-white/5 rounded-xl border border-gray-700"
      />

      <!-- USERS -->
      <div>
        <h2 class="text-gray-400 mb-2">Select Members</h2>

        <div
          v-for="u in userStore.users"
          :key="u._id"
          class="flex justify-between items-center p-3 bg-white/5 rounded-xl mb-2 cursor-pointer"
          @click="groupStore.toggleUser(u)"
        >

          <div class="flex items-center gap-3">
            <img
              :src="u.avatar || 'https://i.pravatar.cc/150'"
              class="w-10 h-10 rounded-full"
            />

            <div>
              <p>{{ u.name }}</p>
              <p class="text-xs text-gray-400">{{ u.email }}</p>
            </div>
          </div>

          <span v-if="isSelected(u)" class="text-green-400">✔</span>

        </div>
      </div>

      <!-- CREATE -->
      <button
        class="w-full bg-green-500 text-black py-3 rounded-xl font-bold"
        @click="create"
      >
        Create Group
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGroupStore } from "../../store/groupStore";
import { useUserStore } from "../../store/userStore";
import { useRouter } from "vue-router";

const groupStore = useGroupStore();
const userStore = useUserStore();
const router = useRouter();

const name = ref("");
const description = ref("");

onMounted(() => {
  userStore.getUsers();
});

const isSelected = (user) => {
  return groupStore.selectedUsers.some(u => u._id === user._id);
};

const create = async () => {
  if (!name.value) return;

  await groupStore.createGroup(name.value, description.value);

  router.push("/groups");
};
</script>