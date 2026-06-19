<template>
  <div
    class="flex w-full mb-3"
    :class="isMine ? 'justify-end' : 'justify-start'"
  >
    <div
      ref="bubbleRef"
      class="relative max-w-[75%] overflow-visible"
    >

      <!-- TEXT -->
      <div
        v-if="msg.type === 'text' || !msg.type"
        class="relative rounded-2xl px-4 py-3 pr-10 break-words shadow-md"
        :class="
          isMine
            ? 'bg-green-500 text-black rounded-br-sm'
            : 'bg-gray-700 text-white rounded-bl-sm'
        "
      >
        {{ msg.content }}

        <button
          class="absolute top-1 right-1 px-2 text-sm"
          @click.stop="toggleMenu($event)"
        >
          ⋮
        </button>
      </div>

      <!-- IMAGE -->
      <div v-else-if="msg.type === 'image'" class="relative">
        <img
          :src="msg.url"
          class="max-w-[250px] max-h-[250px] rounded-2xl object-cover"
        />

        <button
          class="absolute top-1 right-1 bg-black/40 text-white rounded px-2"
          @click.stop="toggleMenu($event)"
        >
          ⋮
        </button>
      </div>

      <!-- VIDEO -->
      <div v-else-if="msg.type === 'video'" class="relative">
        <video
          :src="msg.url"
          controls
          class="max-w-[250px] max-h-[250px] rounded-2xl"
        />

        <button
          class="absolute top-1 right-1 bg-black/40 text-white rounded px-2"
          @click.stop="toggleMenu($event)"
        >
          ⋮
        </button>
      </div>

      <!-- AUDIO -->
      <div v-else-if="msg.type === 'audio'" class="relative bg-gray-700 p-3 rounded-2xl">
        <audio :src="msg.url" controls class="w-[250px]" />

        <button
          class="absolute top-1 right-1 text-white px-2"
          @click.stop="toggleMenu($event)"
        >
          ⋮
        </button>
      </div>

      <!-- FILE -->
      <div v-else-if="msg.type === 'file'" class="relative bg-gray-700 p-4 rounded-2xl text-white">
        <a :href="msg.url" target="_blank">📄 Download File</a>

        <button
          class="absolute top-1 right-1 px-2"
          @click.stop="toggleMenu($event)"
        >
          ⋮
        </button>
      </div>


      <!-- CALL MESSAGE -->
      <div
        v-else-if="msg.type === 'call'"
        class="relative bg-gray-800 text-white rounded-2xl px-4 py-3 border border-gray-700"
      >
        <div class="flex items-center gap-2 pr-8">
          <span class="text-lg">
            {{ msg.content?.includes("Video") ? "📹" : "📞" }}
          </span>

          <span>
            {{ msg.content }}
          </span>
        </div>

        <!-- MENU BUTTON -->
        <button
          class="absolute top-1 right-1 text-white px-2"
          @click.stop="toggleMenu($event)"
        >
          ⋮
        </button>
      </div>

      <!-- MENU (FULL SAFE FIX) -->
      <div
        v-if="showMenu"
        class="fixed z-[99999] w-36 rounded-lg border border-gray-700 bg-[#111827] shadow-2xl"
        :style="menuStyle"
      >
        <button
          class="block w-full px-3 py-2 text-left text-white hover:bg-gray-700"
          @click="copyText"
        >
          Copy
        </button>

        <button
          class="block w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700"
          @click="deleteMessage"
        >
          Delete
        </button>

        <button
          class="block w-full px-3 py-2 text-left text-white hover:bg-gray-700"
          @click="showMenu = false"
        >
          Close
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";

const props = defineProps({
  msg: Object,
  userId: String,
});

const emit = defineEmits(["delete", "preview"]);

const showMenu = ref(false);
const bubbleRef = ref(null);

const menuStyle = ref({
  top: "0px",
  left: "0px",
});

const isMine = computed(() => {
  return (props.msg.sender?._id || props.msg.sender) === props.userId;
});

/* ===================== SAFE MENU POSITION ===================== */
const toggleMenu = async (event) => {
  showMenu.value = !showMenu.value;

  if (showMenu.value) {
    await nextTick();

    const rect = event.target.getBoundingClientRect();

    const menuW = 140;
    const menuH = 120;

    let left = rect.left;
    let top = rect.bottom + 6;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // right overflow fix
    if (left + menuW > screenW) {
      left = screenW - menuW - 10;
    }

    // left overflow fix
    if (left < 10) {
      left = 10;
    }

    // bottom overflow fix (IMPORTANT)
    if (top + menuH > screenH) {
      top = rect.top - menuH - 6;
    }

    menuStyle.value = {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
    };
  }
};

const deleteMessage = () => {
  emit("delete", props.msg._id);
  showMenu.value = false;
};

const copyText = async () => {
  await navigator.clipboard.writeText(
    props.msg.content || props.msg.url || ""
  );
  showMenu.value = false;
};

const handleOutsideClick = (e) => {
  if (bubbleRef.value && !bubbleRef.value.contains(e.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});


const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};


</script>