import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "ab994c07eee7434887a63166f8afcf40";
const API_BASE = "https://chatapp-backend-3exy.onrender.com";

class AgoraService {
  constructor() {
    this.client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });
  }

  // 🔥 FIXED TOKEN REQUEST (safe + validation)
  async getToken(channel, uid) {
    try {
      if (!channel) throw new Error("Channel is missing");
      if (!uid) uid = 1; // fallback

      const res = await fetch(`${API_BASE}/agora/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName: channel,
          uid: Number(uid),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend Error:", data);
        throw new Error(data?.error || "Token API failed");
      }

      if (!data.token) {
        throw new Error("Token not received from backend");
      }

      return data.token;
    } catch (err) {
      console.error("Agora getToken error:", err);
      throw err;
    }
  }

  async join(channel, uid) {
    const token = await this.getToken(channel, uid);

    await this.client.join(APP_ID, channel, token, uid);
  }

  async publishTracks(type = "video") {
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    let videoTrack = null;

    if (type === "video") {
      videoTrack = await AgoraRTC.createCameraVideoTrack();
      await this.client.publish([audioTrack, videoTrack]);
    } else {
      await this.client.publish([audioTrack]);
    }

    return { audio: audioTrack, video: videoTrack };
  }

  subscribeEvents(onJoin, onLeave, onVideo) {
    this.client.on("user-published", async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);

      if (mediaType === "video") {
        onVideo?.(user.videoTrack);
      }

      if (mediaType === "audio") {
        user.audioTrack.play();
      }

      onJoin?.(user);
    });

    this.client.on("user-unpublished", (user) => {
      onLeave?.(user);
    });
  }

  async leave() {
    await this.client.leave();
  }
}

export default new AgoraService();