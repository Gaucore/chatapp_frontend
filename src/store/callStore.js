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

    /* ================= SOCKET INIT ================= */
    init() {
      socket.on("incoming-call", (data) => {
        this.incomingCall = data;
        this.callerId = data.from;
        this.callType = data.callType;
      });

      socket.on("call-rejected", () => this.cleanup());
      socket.on("call-ended", () => this.cleanup());

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
          console.log(e);
        }
      });
    },

    /* ================= START CALL ================= */
    async startCall(toUserId, type = "video") {
      this.receiverId = toUserId;
      this.callType = type;

      const stream = await navigator.mediaDevices.getUserMedia({
        video:
          type === "video"
            ? { facingMode: "user" }
            : false,
        audio: true,
      });

      this.localStream = stream;

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun.cloudflare.com:3478" },
        ],
      });

      this.peer = peer;

      /* ADD TRACKS */
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      /* FIXED REMOTE STREAM */
      this.remoteStream = new MediaStream();

      peer.ontrack = (event) => {
        const track = event.track;

        const exists = this.remoteStream
          .getTracks()
          .some((t) => t.id === track.id);

        if (!exists) {
          this.remoteStream.addTrack(track);
        }
      };

      /* ICE CANDIDATE */
      peer.onicecandidate = (event) => {
        if (!event.candidate) return;

        socket.emit("ice-candidate", {
          to: this.receiverId,
          candidate: event.candidate, // IMPORTANT FIX
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

    /* ================= ACCEPT CALL ================= */
    async acceptCall() {
      const call = this.incomingCall;
      if (!call) return;

      this.receiverId = call.from;
      this.callType = call.callType;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: call.callType === "video"
          ? { facingMode: "user" }
          : false,
        audio: true,
      });

      this.localStream = stream;

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun.cloudflare.com:3478" },
        ],
      });

      this.peer = peer;

      /* ADD TRACKS */
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      /* FIXED REMOTE STREAM */
      this.remoteStream = new MediaStream();

      peer.ontrack = (event) => {
        const track = event.track;

        const exists = this.remoteStream
          .getTracks()
          .some((t) => t.id === track.id);

        if (!exists) {
          this.remoteStream.addTrack(track);
        }
      };

      /* ICE */
      peer.onicecandidate = (event) => {
        if (!event.candidate) return;

        socket.emit("ice-candidate", {
          to: this.receiverId,
          candidate: event.candidate,
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

    /* ================= END CALL ================= */
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

    /* ================= CLEANUP ================= */
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