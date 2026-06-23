import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "ab994c07eee7434887a63166f8afcf40";
// const API_BASE = "http://localhost:5000";
const API_BASE = "https://chatapp-backend-3exy.onrender.com";


class AgoraService {
  constructor() {
    this.client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });
    
  }

  async getToken(channel, uid) {
    const safeUid =
      uid && uid !== "null"
        ? Number(uid)
        : Math.floor(Math.random() * 100000);

    const res = await fetch(`${API_BASE}/agora/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channelName: channel,
        uid: safeUid,
      }),
    });

    const data = await res.json();

    console.log("TOKEN RESPONSE:", data);

    if (!res.ok || !data.token) {
      throw new Error(data.error || "Token failed");
    }

    return {
      token: data.token,
      uid: data.uid || safeUid,
    };
  }

  async join(channel, uid) {
    const { token, uid: safeUid } = await this.getToken(channel, uid);

    await this.client.join(APP_ID, channel, token, safeUid);
  }

  async publishTracks(type) {
      if (type === "video") {
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();

        await this.client.publish([audioTrack, videoTrack]);

        return { audio: audioTrack, video: videoTrack };
      }

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({  AEC: true, ANS: true, AGC: true,});
      await this.client.publish([audioTrack]);

      return { audio: audioTrack };
    }

    // async leave() {
    //   try {
    //     if (this.client) {
    //       await this.client.unpublish?.();
    //       await this.client.leave();
    //     }
    //   } catch (err) {
    //     console.log("Leave ignored:", err);
    //   }
    // }

    async leave() {
      try {

        if (!this.client) return;

        const localTracks = [];

        this.client.localTracks?.forEach(track => {
          if (track) {
            localTracks.push(track);
          }
        });

        for (const track of localTracks) {
          try {
            await this.client.unpublish(track);
          } catch (e) {}

          try {
            track.stop();
          } catch (e) {}

          try {
            track.close();
          } catch (e) {}
        }

        await this.client.leave();

      } catch (err) {
        console.log("Leave ignored:", err);
      }
    }

}

export default new AgoraService();