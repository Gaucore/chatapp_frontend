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
  }),

  actions: {
    setUser(id) {
      this.userId = id;
    },

    init() {
      socket.on("incoming-call", (data) => {
        this.incomingCall = data;
      });

      socket.on("call-ended", () => this.endCall());
    },

    async startCall(toUserId, type = "video") {
      this.callType = type;
      this.receiverId = toUserId;

      const channel = `call_${this.userId}_${toUserId}`;
      this.channel = channel;

      await agora.join(channel, this.userId);

      const tracks = await agora.publishTracks(type);

      this.localAudioTrack = tracks.audio;
      this.localVideoTrack = tracks.video;

      agora.subscribeEvents(
        () => {},
        () => {},
        (videoTrack) => {
          this.remoteVideoTrack = videoTrack;
          this.callActive = true;
        }
      );

      socket.emit("call-user", {
        to: toUserId,
        from: this.userId,
        callType: type,
        channel,
      });
    },

    async acceptCall() {
      const call = this.incomingCall;
      if (!call) return;

      this.callType = call.callType;
      this.receiverId = call.from;
      this.channel = call.channel;

      await agora.join(call.channel, this.userId);

      const tracks = await agora.publishTracks(call.callType);

      this.localAudioTrack = tracks.audio;
      this.localVideoTrack = tracks.video;

      agora.subscribeEvents(
        () => {},
        () => {},
        (videoTrack) => {
          this.remoteVideoTrack = videoTrack;
          this.callActive = true;
        }
      );

      this.incomingCall = null;
    },

    async endCall() {
      socket.emit("call-ended", {
        to: this.receiverId || this.incomingCall?.from,
      });

      await agora.leave();

      this.localAudioTrack = null;
      this.localVideoTrack = null;
      this.remoteVideoTrack = null;

      this.callActive = false;
      this.incomingCall = null;
    },
  },
});