import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "ab994c07eee7434887a63166f8afcf40";

class AgoraService {
  constructor() {
    this.client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });

    this.localAudioTrack = null;
    this.localVideoTrack = null;
  }

  async join(channel, uid) {
    await this.client.join(APP_ID, channel, null, uid);
  }

  async publishTracks(type = "video") {
    this.localAudioTrack =
      await AgoraRTC.createMicrophoneAudioTrack();

    if (type === "video") {
      this.localVideoTrack =
        await AgoraRTC.createCameraVideoTrack();

      await this.client.publish([
        this.localAudioTrack,
        this.localVideoTrack,
      ]);
    } else {
      await this.client.publish([this.localAudioTrack]);
    }

    return {
      audio: this.localAudioTrack,
      video: this.localVideoTrack,
    };
  }

  subscribeEvents(onJoin, onLeave, onVideo) {
    this.client.on("user-published", async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);

      if (mediaType === "video") {
        onVideo(user.videoTrack);
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
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    await this.client.leave();
  }
}

export default new AgoraService();