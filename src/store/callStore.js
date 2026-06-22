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
    chatId: null,
  }),

  actions: {
    setChatId(id) {
      this.chatId = id;
    },

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
        this.callActive = true;
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

    async startCall(toUserId, type = "video") {
      this.receiverId = toUserId;
      this.callType = type;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video" ? { facingMode: "user" } : false,
        audio: true,
      });

      this.localStream = stream;
      this.remoteStream = new MediaStream(); // FIXED

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      this.peer = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }

        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream.addTrack(track);
        });
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate) return;

        socket.emit("ice-candidate", {
          to: this.receiverId,
          candidate: event.candidate
        });
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call-user", {
        to: this.receiverId,
        from: this.userId,
        offer,
        callType: type,
      });

      this.callActive = true;
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
      this.remoteStream = new MediaStream();

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });

      this.peer = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream.addTrack(track);
        });
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate) return;

        socket.emit("ice-candidate", {
          to: this.receiverId,
          candidate: event.candidate.toJSON(), // 🔥 FIX
        });
      };

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
      this.callActive = true;
    },
    
    endCall() {
      socket.emit("call-ended", {
        to: this.receiverId || this.callerId,
      });

      this.cleanup();
    },

    rejectCall() {
      socket.emit("reject-call", {
        to: this.callerId,
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

      this.incomingCall = null;
      this.callActive = false;
      this.callType = null;
      this.callerId = null;
      this.receiverId = null;
    },
  },
});