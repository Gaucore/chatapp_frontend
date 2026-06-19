<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] overflow-hidden"
    @wheel="handleZoom"
  >

    <!-- CLOSE BUTTON -->
    <button
      class="absolute top-4 right-4 text-white text-3xl z-50"
      @click="$emit('close')"
    >
      ✕
    </button>

    <!-- IMAGE (ZOOMABLE) -->
    <img
      v-if="isImage"
      :src="url"
      class="select-none max-w-[90vw] max-h-[90vh] object-contain cursor-grab"
      :style="imageStyle"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      draggable="false"
      alt="preview"
    />

    <!-- VIDEO -->
    <video
      v-else-if="isVideo"
      :src="url"
      controls
      autoplay
      class="max-w-[95%] max-h-[95%] rounded-lg"
    />

    <!-- AUDIO -->
    <audio
      v-else-if="isAudio"
      :src="url"
      controls
      autoplay
    />

    <!-- FILE -->
    <div v-else class="bg-white text-black p-4 rounded-lg">
      <a :href="url" target="_blank" class="font-medium">
        Open / Download File
      </a>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  visible: Boolean,
  url: String,
  type: String
});

defineEmits(["close"]);

/* ================= TYPE ================= */
const normalizedType = computed(() =>
  (props.type || "").toLowerCase()
);

const isImage = computed(() => normalizedType.value === "image");
const isVideo = computed(() => normalizedType.value === "video");
const isAudio = computed(() => normalizedType.value === "audio");

/* ================= ZOOM ================= */
const scale = ref(1);
const minScale = 1;
const maxScale = 3;

/* ================= DRAG ================= */
const posX = ref(0);
const posY = ref(0);
const dragging = ref(false);
const startX = ref(0);
const startY = ref(0);

const imageStyle = computed(() => ({
  transform: `scale(${scale.value}) translate(${posX.value}px, ${posY.value}px)`,
  transformOrigin: "center"
}));

/* ================= ZOOM (WHEEL) ================= */
const handleZoom = (e) => {
  if (!isImage.value) return;

  e.preventDefault();

  if (e.deltaY < 0) {
    scale.value = Math.min(maxScale, scale.value + 0.2);
  } else {
    scale.value = Math.max(minScale, scale.value - 0.2);
  }
};

/* ================= DRAG ================= */
const startDrag = (e) => {
  if (scale.value <= 1) return;

  dragging.value = true;
  startX.value = e.clientX - posX.value;
  startY.value = e.clientY - posY.value;
};

const onDrag = (e) => {
  if (!dragging.value) return;

  posX.value = e.clientX - startX.value;
  posY.value = e.clientY - startY.value;
};

const stopDrag = () => {
  dragging.value = false;
};
</script>