<script setup>
import { onMounted } from "vue";
import { useCallStore } from "../src/store/callStore";
import CallScreen from "../src/components/call/CallScreen.vue";

const callStore = useCallStore();

onMounted(() => {
  callStore.init();
});

</script>

<template>
<router-view></router-view>
<CallScreen />
</template>
