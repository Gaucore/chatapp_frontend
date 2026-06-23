import { defineStore } from "pinia";
import agora from "../services/agoraService";
import socket from "../socket/socket";

export const useCallStore = defineStore("call", {
  state: () => ({
    callActive: false,
    callType: null,

    localAudioTrack: null,
    localVideoTrack: null,
    remoteVideoTrack: null,

    incomingCall: null,

    channel: null,
    userId: null,
    receiverId: null,
    isJoining: false,
  }),

  actions: {
    setUser(id) {
      this.userId = id;
    },

    init() {
      socket.off("incoming-call");
      socket.off("call-ended");
      socket.off("call-rejected");

      socket.on("incoming-call", (data) => {
        console.log("INCOMING CALL:", data);

        this.incomingCall = {
          ...data,
          channel: data.channel, // 🔥 ensure channel exists
        };
      });

      socket.on("call-ended", () => {
        this.forceEndCall();
      });

      socket.on("call-rejected", () => {
        this.forceEndCall();
      });
    },

    rejectCall() {
      if (!this.incomingCall) return;

      socket.emit("reject-call", {
        to: this.incomingCall.from,
      });

      this.forceEndCall();
    },

    forceEndCall() {
      this.localAudioTrack?.close();
      this.localVideoTrack?.close();

      this.localAudioTrack = null;
      this.localVideoTrack = null;
      this.remoteVideoTrack = null;

      this.callActive = false;
      this.incomingCall = null;
      this.channel = null;
      this.receiverId = null;
      this.callType = null;
      this.isJoining = false;
    },

    // async startCall(toUserId, type = "video") {
    //   if (!this.userId) return;

    //     if (this.isJoining || this.callActive) return;

    //   this.isJoining = true;

    //   try {
    //     this.callType = type;
    //     this.receiverId = toUserId;

    //     const channel = `call_${this.userId}_${toUserId}`;
    //     this.channel = channel;

    //     await agora.join(channel, this.userId);

    //     const tracks = await agora.publishTracks(type);

    //     this.localAudioTrack = tracks.audio;
    //     this.localVideoTrack = tracks.video;

    //     this.callActive = true;

    //     agora.client.removeAllListeners("user-published");

    //     agora.client.on("user-published", async (user, mediaType) => {
    //       await agora.client.subscribe(user, mediaType);

    //       if (mediaType === "video") {
    //         this.remoteVideoTrack = user.videoTrack;
    //       }

    //       if (mediaType === "audio") {
    //         user.audioTrack?.play();
    //       }
    //     });

    //     socket.emit("call-user", {
    //       to: toUserId,
    //       from: this.userId,
    //       callType: type,
    //       channel: channel,
    //     });

    //   } catch (err) {
    //     console.error("CALL FAILED:", err);
    //     this.forceEndCall();
    //   }
    // },


    async startCall(toUserId, type = "video") {
        if (!this.userId) return;

        if (this.isJoining || this.callActive) return;

        this.isJoining = true;

        try {
          this.callType = type;
          this.receiverId = toUserId;

          const channel = `call_${this.userId}_${toUserId}`;
          this.channel = channel;

          await agora.join(channel, this.userId);

          const tracks = await agora.publishTracks(type);

          this.localAudioTrack = tracks.audio;
          this.localVideoTrack = tracks.video;

          this.callActive = true;

          agora.client.removeAllListeners("user-published");

          agora.client.on("user-published", async (user, mediaType) => {
            await agora.client.subscribe(user, mediaType);

            if (mediaType === "video") {
              const remoteTrack = user.videoTrack;

              if (remoteTrack) {
                this.remoteVideoTrack = remoteTrack;

                // 🔥 IMPORTANT FIX (receiver fix)
                setTimeout(() => {
                  const el = document.getElementById("remote-video");
                  if (el) {
                    remoteTrack.play(el);
                  }
                }, 500);
              }
            }

            if (mediaType === "audio") {
              user.audioTrack?.play();
            }
          });

          socket.emit("call-user", {
            to: toUserId,
            from: this.userId,
            callType: type,
            channel,
          });

        } catch (err) {
          console.error("CALL FAILED:", err);
          this.forceEndCall();
        } finally {
          this.isJoining = false;
        }
      },

    
      async acceptCall() {
        const call = this.incomingCall;

        if (!call || !this.userId) return;

        if (this.isJoining || this.callActive) return;

        this.isJoining = true;

        const channel = call.channel || `call_${call.from}_${this.userId}`;

        try {
          this.callType = call.callType;
          this.receiverId = call.from;
          this.channel = channel;

          this.incomingCall = null;

          await agora.join(channel, this.userId);

          const tracks = await agora.publishTracks(call.callType);

          this.localAudioTrack = tracks.audio;
          this.localVideoTrack = tracks.video;

          this.callActive = true;

          agora.client.removeAllListeners("user-published");

          // agora.client.on("user-published", async (user, mediaType) => {
          //   await agora.client.subscribe(user, mediaType);

          //   if (mediaType === "video") {
          //     this.remoteVideoTrack = user.videoTrack;
          //   }

          //   if (mediaType === "audio") {
          //     user.audioTrack?.play();
          //   }
          // });

          agora.client.on("user-published", async (user, mediaType) => {
            await agora.client.subscribe(user, mediaType);

            if (mediaType === "video") {
              const remoteTrack = user.videoTrack;

              if (remoteTrack) {
                this.remoteVideoTrack = remoteTrack;

                // 🔥 FORCE PLAY FIX
                setTimeout(() => {
                  const el = document.getElementById("remote-video");
                  if (el) {
                    remoteTrack.play(el);
                  }
                }, 500);
              }
            }

            if (mediaType === "audio") {
              user.audioTrack?.play();
            }
          });

          socket.emit("call-accepted", {
            to: call.from,
            channel,
          });

        } catch (err) {
          console.error("ACCEPT CALL ERROR:", err);
          this.forceEndCall();
        } finally {
          this.isJoining = false;
        }
      },
  
  
  async endCall() {
      socket.emit("call-ended", {
        to: this.receiverId || this.incomingCall?.from,
      });

      await agora.leave();

      this.forceEndCall();
    },
  },
});