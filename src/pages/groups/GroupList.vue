<template>
  <div class="h-screen bg-[#0b1220] text-white flex flex-col">

    <!-- NAV -->
    <van-nav-bar
      title="Groups"
      left-arrow
      @click-left="$router.back()"
      fixed
    />

    <div class="flex-1 overflow-y-auto p-4 mt-14 space-y-3">

      <!-- CREATE BUTTON -->
      <button
        class="w-full bg-green-500 text-black py-3 rounded-xl font-bold"
        @click="$router.push('/groups/create')"
      >
        + Create New Group
      </button>

      <!-- GROUP LIST -->
      <div
        v-for="g in groupStore.groups"
        :key="g._id"
        class="p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10"
        @click="openGroup(g)"
      >

        <div class="flex justify-between items-center">

          <div>
            <p class="font-bold text-lg">{{ g.name }}</p>
            <p class="text-xs text-gray-400">
              {{ g.members.length }} members
            </p>
          </div>

          <div class="text-green-400 text-xs">
            OPEN
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useGroupStore } from "../../store/groupStore";
import { useRouter } from "vue-router";

const groupStore = useGroupStore();
const router = useRouter();

onMounted(() => {
  groupStore.fetchGroups();
});

const openGroup = (group) => {
  groupStore.setActiveGroup(group);
  router.push("/home?group=" + group._id);
};
</script>