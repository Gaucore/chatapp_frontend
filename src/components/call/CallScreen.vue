<template>
  <div
    v-if="callStore.callActive || callStore.incomingCall"
    class="fixed inset-0 z-[99999] bg-black"
  >
    <!-- ================= INCOMING CALL ================= -->
    <div
      v-if="callStore.incomingCall"
      class="h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#111827] to-black text-white"
    >
      <img
        :src="userAvatar"
        class="w-36 h-36 rounded-full object-cover border-4 border-white/20 shadow-2xl"
      />

      <h2 class="mt-6 text-3xl font-semibold">
        {{ userName }}
      </h2>

      <p class="text-gray-400 mt-2 text-lg">
        Incoming {{ callStore.incomingCall.callType }} Call
      </p>

      <div class="flex gap-10 mt-12">
        <button
          @click="callStore.acceptCall()"
          class="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-xl"
        >
          <Phone class="w-8 h-8 text-white" />
        </button>

        <button
          @click="callStore.rejectCall()"
          class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-xl"
        >
          <PhoneOff class="w-8 h-8 text-white" />
        </button>
      </div>
    </div>

    <!-- ================= ACTIVE CALL ================= -->
    <template v-else>

      <!-- VIDEO CALL -->
      <div
        v-if="callStore.callType === 'video'"
        class="relative w-full h-full"
      >
        <!-- Remote -->
        <video
          ref="remoteVideo"
          autoplay
          playsinline
          class="absolute inset-0 w-full h-full object-cover"
        />

        <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

        <!-- User Info -->
        <div class="absolute top-10 left-0 right-0 text-center z-20">
          <h2 class="text-3xl font-semibold">{{ userName }}</h2>
          <p class="text-gray-300">Connected</p>
        </div>

        <!-- Local Video -->
        <video
          ref="localVideo"
          autoplay
          playsinline
          muted
          class="absolute bottom-32 right-4 md:right-8 w-28 h-40 md:w-44 md:h-56 rounded-2xl object-cover border border-white/20 shadow-2xl z-30"
        />
      </div>

      <!-- AUDIO CALL -->
      <div
        v-else
        class="h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#111827] to-black text-white"
      >
        <img
          :src="userAvatar"
          class="w-40 h-40 rounded-full object-cover border-4 border-white/10 shadow-2xl"
        />

        <h2 class="mt-8 text-4xl font-semibold">{{ userName }}</h2>

        <p class="text-gray-400 mt-3 text-lg">Audio Call Connected</p>
      </div>

      <!-- ================= CONTROLS ================= -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">

        <button @click="toggleSpeaker" class="call-btn">
          <Volume2 v-if="speakerOn" class="icon" />
          <VolumeX v-else class="icon" />
        </button>

        <button @click="toggleMic" class="call-btn">
          <Mic v-if="micOn" class="icon" />
          <MicOff v-else class="icon" />
        </button>

        <button @click="callStore.endCall()" class="end-btn">
          <PhoneOff class="icon" />
        </button>

        <button
          v-if="callStore.callType === 'video'"
          @click="toggleCamera"
          class="call-btn"
        >
          <Video v-if="cameraOn" class="icon" />
          <VideoOff v-else class="icon" />
        </button>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { useCallStore } from "../../store/callStore";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Video, VideoOff
} from "lucide-vue-next";

const callStore = useCallStore();

const localVideo = ref(null);
const remoteVideo = ref(null);

const micOn = ref(true);
const speakerOn = ref(true);
const cameraOn = ref(true);

/* ================= FIX USER ================= */
const userName = computed(() =>
  callStore.incomingCall?.from || "User"
);

const userAvatar = computed(() =>
  callStore.incomingCall?.avatar ||
  "https://ui-avatars.com/api/?name=User"
);

/* ================= FIX AGORA TRACK PLAY ================= */
const playTrack = async (track, el) => {
  if (!track || !el) return;
  await nextTick();
  track.play(el);
};

/* ================= FIXED STREAM BIND ================= */
watch(
  () => callStore.localVideoTrack,
  async (track) => {
    await playTrack(track, localVideo.value);
  },
  { immediate: true }
);

watch(
  () => callStore.remoteVideoTrack,
  async (track) => {
    await playTrack(track, remoteVideo.value);
  },
  { immediate: true }
);

/* ================= CONTROLS ================= */
const toggleMic = () => {
  micOn.value = !micOn.value;
  callStore.localAudioTrack?.setEnabled(micOn.value);
};

const toggleSpeaker = () => {
  speakerOn.value = !speakerOn.value;
};

const toggleCamera = () => {
  cameraOn.value = !cameraOn.value;
  callStore.localVideoTrack?.setEnabled(cameraOn.value);
};
</script>

<style>
.call-btn {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  transition: 0.2s;
}

.call-btn:hover {
  transform: scale(1.08);
}

.end-btn {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 24px;
  height: 24px;
  color: white;
}
</style>