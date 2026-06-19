<template>
  <div
    class="relative p-3 bg-[#111827] border-t border-gray-800 flex items-center gap-2"
  >
    <!-- ATTACHMENT MENU -->
    <van-popover
      v-model:show="showPopover"
      placement="top-start"
      teleport="body"
    >
      <van-grid :border="false" column-num="3" style="width: 280px">
        <van-grid-item @click="selectType('image')">
          <template #icon>
            <div class="menu-icon image">
              <van-icon name="photo-o" size="28" />
            </div>
          </template>
          <template #text>Gallery</template>
        </van-grid-item>

        <van-grid-item @click="selectType('camera')">
          <template #icon>
            <div class="menu-icon camera">
              <van-icon name="photograph" size="28" />
            </div>
          </template>
          <template #text>Camera</template>
        </van-grid-item>

        <van-grid-item @click="selectType('file')">
          <template #icon>
            <div class="menu-icon document">
              <van-icon name="description" size="28" />
            </div>
          </template>
          <template #text>Document</template>
        </van-grid-item>

        <van-grid-item @click="selectType('contact')">
          <template #icon>
            <div class="menu-icon contact">
              <van-icon name="friends-o" size="28" />
            </div>
          </template>
          <template #text>Contact</template>
        </van-grid-item>

        <van-grid-item @click="selectType('location')">
          <template #icon>
            <div class="menu-icon location">
              <van-icon name="location-o" size="28" />
            </div>
          </template>
          <template #text>Location</template>
        </van-grid-item>

        <van-grid-item @click="selectType('audio')">
          <template #icon>
            <div class="menu-icon audio">
              <van-icon name="music-o" size="28" />
            </div>
          </template>
          <template #text>Audio</template>
        </van-grid-item>
      </van-grid>

      <template #reference>
        <button
          class="w-11 h-11 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
        >
          <van-icon name="plus" size="24" color="#a855f7" />
        </button>
      </template>
    </van-popover>

    <!-- FILE INPUT -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      @change="handleFileUpload"
    />

    <!-- MESSAGE INPUT -->
    <textarea
      :value="modelValue"
      @input="onInput"
      @keydown="handleKeyDown"
      placeholder="Type a message..."
      class="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white outline-none resize-none"
      rows="1"
    />

    <van-button round type="success" @click="sendMessage">
      Send
    </van-button>

    <!-- DESKTOP ONLY POPUP -->
    <FilePreviewPopup
      v-if="isDesktop && selectedFile"
      :file="selectedFile"
      @send="sendFile"
      @cancel="cancelFile"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useFileStore } from "../../store/file.store";
import FilePreviewPopup from "../../components/chat/FilePreviewPopup.vue";

const fileStore = useFileStore();

const showPopover = ref(false);
const fileInput = ref(null);
const selectedFile = ref(null);
const isDesktop = ref(true);

/* =========================
   SCREEN DETECTION
========================= */
const checkScreen = () => {
  isDesktop.value = window.innerWidth >= 768;
};

onMounted(() => {
  checkScreen();
  window.addEventListener("resize", checkScreen);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreen);
});

defineProps({
  modelValue: String,
});

const emit = defineEmits([
  "update:modelValue",
  "send",
  "file",
  "contact",
  "location",
  "audio",
  "camera",
]);

/* =========================
   INPUT
========================= */
const onInput = (e) => emit("update:modelValue", e.target.value);

const handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const sendMessage = () => emit("send");

/* =========================
   TYPE SELECT
========================= */
const selectType = (type) => {
  showPopover.value = false;

  if (!fileInput.value) return;

  const input = fileInput.value;

  if (type === "image") {
    input.accept = "image/*";
    input.removeAttribute("capture");
    input.dataset.type = "image";
    input.click();
    return;
  }

  if (type === "camera") {
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.dataset.type = "camera";
    input.click();
    return;
  }

  if (type === "file") {
    input.accept = "*/*";
    input.dataset.type = "file";
    input.click();
    return;
  }

  if (type === "audio") {
    input.accept = "audio/*";
    input.dataset.type = "audio";
    input.click();
    return;
  }

  if (type === "location") return getLocation();
  /*if (type === "contact") emit("contact");*/

  if (type === "contact") {
  emit("contact", {
    name: "Jay",
    phone: "9876543210",
  })
  return;
  }
};

/* =========================
   FILE CHANGE
   (IMPORTANT FIX HERE)
========================= */
const handleFileUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const type = e.target.dataset.type || "file";

  // 👉 MOBILE: direct upload (no popup)
  if (!isDesktop.value) {
    fileStore.uploadFile(file, type).then((res) => {
      emit("file", res);
    });

    e.target.value = "";
    return;
  }

  // 👉 DESKTOP: show preview popup ONLY
  selectedFile.value = file;
};

/* =========================
   SEND FROM POPUP
========================= */
const sendFile = async (file) => {
  const type = fileInput.value?.dataset?.type || "file";

  const result = await fileStore.uploadFile(file, type);

  emit("file", result);

  selectedFile.value = null;
  fileInput.value.value = "";
};

/* =========================
   CANCEL (NO UPLOAD)
========================= */
const cancelFile = () => {
  selectedFile.value = null;

  // IMPORTANT: prevent accidental upload
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

/* =========================
   LOCATION
========================= */
const getLocation = () => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition((pos) => {
    emit("location", {
      type: "location",
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      url: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`,
    });
  });
};
</script>