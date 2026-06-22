import { defineStore } from "pinia";
import socket from "../socket/socket";

export const useCallStore = defineStore("call", {
  state: () => ({
    incomingCall: null,
    peer: null,
    localStream: null,
    remoteStream: null,

    callActive: false,
    callType: null,
    callerId: null,
    receiverId: null,
    callUser: null,
    userId: null,
  }),

  actions: {
    setUser(id) {
      this.userId = id;
    },

    init() {
      socket.on("incoming-call", (data) => {
        this.incomingCall = data;
        this.callerId = data.from;
        this.callType = data.callType;
      });

      socket.on("call-ended", () => this.cleanup());
      socket.on("call-rejected", () => this.cleanup());

      socket.on("call-accepted", async ({ answer }) => {
        if (!this.peer) return;
        await this.peer.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (!this.peer || !candidate) return;

        try {
          await this.peer.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (e) {
          console.log("ICE error:", e);
        }
      });
    },

    createPeer() {
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });

      this.peer = peer;
      this.remoteStream = new MediaStream();

      // 🔥 FIX: correct video/audio receive
      peer.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream.addTrack(track);
        });

        this.callActive = true;
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate) return;

        socket.emit("ice-candidate", {
          to: this.receiverId || this.callerId,
          candidate: event.candidate.toJSON(),
        });
      };

      return peer;
    },

    async startCall(toUserId, type = "video") {
      this.receiverId = toUserId;
      this.callType = type;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video" ? true : false,
        audio: true,
      });

      this.localStream = stream;

      const peer = this.createPeer();

      // add audio + video tracks
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call-user", {
        to: this.receiverId,
        from: this.userId,
        offer,
        callType: type,
      });
    },

    async acceptCall() {
      const call = this.incomingCall;
      if (!call) return;

      this.receiverId = call.from;
      this.callType = call.callType;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: call.callType === "video",
        audio: true,
      });

      this.localStream = stream;

      const peer = this.createPeer();

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      await peer.setRemoteDescription(
        new RTCSessionDescription(call.offer)
      );

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("call-accepted", {
        to: this.receiverId,
        answer,
      });

      this.incomingCall = null;
    },

    endCall() {
      socket.emit("call-ended", {
        to: this.receiverId || this.callerId,
      });

      this.cleanup();
    },

    cleanup() {
      if (this.peer) {
        this.peer.close();
        this.peer = null;
      }

      this.localStream?.getTracks().forEach((t) => t.stop());
      this.remoteStream?.getTracks?.().forEach((t) => t.stop());

      this.localStream = null;
      this.remoteStream = null;
      this.callActive = false;
      this.incomingCall = null;
    },
  },
});