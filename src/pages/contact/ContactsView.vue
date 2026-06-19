<template>
  <div class="h-screen bg-gradient-to-b from-[#070b14] via-[#0b1220] to-[#0b1220] text-white flex flex-col">

    <!-- NAVBAR -->
    <van-nav-bar
      title="Contacts"
      left-arrow
      @click-left="$router.back()"
      class="contacts-nav"
      fixed
    />

    <!-- SEARCH BAR -->
    <div class="p-4 mt-14">
      <input
        v-model="keyword"
        @input="onSearch"
        placeholder="Search users..."
        class="w-full p-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-green-400"
      />
    </div>

    <!-- CONTENT -->
    <div class="flex-1 overflow-y-auto px-4 space-y-4">

      <!-- SEARCH RESULTS -->
      <div v-if="keyword && contactStore.searchResults.length">

        <p class="text-gray-400 text-xs mb-2">Search Results</p>

        <div
          v-for="u in contactStore.searchResults"
          :key="u._id"
          class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
        >
          <div class="flex items-center gap-3">

            <img
              v-if="u.avatar"
              :src="u.avatar"
              class="w-10 h-10 rounded-full object-cover"
            />

            <div
              v-else
              class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs"
            >
              N/A
            </div>

            <div>
              <p class="font-semibold">{{ u.name }}</p>
              <p class="text-gray-400 text-xs">{{ u.email }}</p>
            </div>

          </div>

          <button
            class="px-3 py-1 bg-green-500 text-black rounded-lg text-sm"
            @click="add(u._id)"
          >
            Add
          </button>
        </div>
      </div>

      <!-- CONTACT LIST -->
      <div v-else>

        <p class="text-gray-400 text-xs mb-2">My Contacts</p>

        <div
          v-for="c in contactStore.contacts"
          :key="c._id"
          class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
        >
          <div class="flex items-center gap-3">

            <img
              v-if="c.avatar"
              :src="c.avatar"
              class="w-10 h-10 rounded-full object-cover"
            />

            <div
              v-else
              class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs"
            >
              N/A
            </div>

            <div>
              <p class="font-semibold">{{ c.name }}</p>
              <p class="text-gray-400 text-xs">{{ c.email }}</p>
            </div>

          </div>

          <button
            class="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
            @click="remove(c._id)"
          >
            Remove
          </button>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useContactStore } from "../../store/contactStore";

const contactStore = useContactStore();

const keyword = ref("");

onMounted(async () => {
  await contactStore.fetchContacts();
});

/* SEARCH */
const onSearch = async () => {
  if (!keyword.value) return;
  await contactStore.searchUsers(keyword.value);
};

/* ADD CONTACT */
const add = async (id) => {
  await contactStore.addContact(id);
};

/* REMOVE CONTACT */
const remove = async (id) => {
  await contactStore.removeContact(id);
};
</script>

<style>
.contacts-nav {
  background: rgba(17, 24, 39, 0.9) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.contacts-nav .van-nav-bar__title {
  color: white !important;
}
</style>