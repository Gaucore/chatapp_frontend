import { defineStore } from "pinia";
import socket from "../socket/socket";
import api from "../api/axios";

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

    // 🔥 Current chat id
    chatId: null,
  }),

  actions: {
    /* ================= CHAT ID SET ================= */
    setChatId(chatId) {
      this.chatId = chatId;
    },

        setUser(userId) {
          this.userId = userId;
        },

    /* ================= INIT SOCKET ================= */
    init() {
      socket.on("incoming-call", (data) => {
        this.incomingCall = data;
        this.callerId = data.from;
        this.callType = data.callType;
      });

      socket.on("call-rejected", () => {
          if (this.peer) {
            this.peer.close();
            this.peer = null;
          }
          this.localStream?.getTracks().forEach(track => {
            track.stop();
          });

          this.remoteStream?.getTracks?.().forEach(track => {
            track.stop();
          });

          this.resetCall();

        });

      socket.on("call-accepted", async ({ answer }) => {
        if (!this.peer) return;

        try {
          await this.peer.setRemoteDescription(
            new RTCSessionDescription(answer)
          );

          this.callActive = true;
        } catch (error) {
          console.log(error);
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (!this.peer || !candidate) return;

        try {
          await this.peer.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (error) {
          console.log(error);
        }
      });

      socket.on("call-ended", () => {
        if (this.peer) {
          this.peer.close();
          this.peer = null;
        }

        this.localStream?.getTracks().forEach((track) => {
          track.stop();
        });

        this.remoteStream?.getTracks?.().forEach((track) => {
          track.stop();
        });

        this.resetCall();
      });
    },

    /* ================= START CALL ================= */
    async startCall(toUserId, type = "video") {
      try {
        this.receiverId = toUserId;
        this.callType = type;

        this.callActive = true;
        // 🔥 Save call message
        if (this.chatId) {
          await api.post("/messages", {
            chatId: this.chatId,
            type: "call",
            content:
              type === "video"
                ? "📹 Outgoing Video Call"
                : "📞 Outgoing Audio Call",
          });
        }

        const stream = await navigator.mediaDevices.getUserMedia({
              video: type === "video"
                  ? {
                      width: 640,
                      height: 480,
                      facingMode: "user"
                    }
                  : false,

              audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
              },
          });

        this.localStream = stream;

        const peer = new RTCPeerConnection({

              iceServers: [

                  {
                      urls: [
                          "stun:stun.l.google.com:19302",
                          "stun:stun1.l.google.com:19302",
                      ],
                  },

                  {
                      urls: "stun:stun.cloudflare.com:3478",
                  },

              ],

          });

        this.peer = peer;

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });


        peer.onnegotiationneeded = async () => {

            try {

                const offer = await peer.createOffer();

                await peer.setLocalDescription(offer);

            }

            catch (e) {

                console.log(e);

            }

        };

        // peer.ontrack = (event) => {

        //     if (!this.remoteStream) {
        //         this.remoteStream = new MediaStream();
        //     }

        //     event.streams[0]
        //         .getTracks()
        //         .forEach(track => {
        //             this.remoteStream.addTrack(track);
        //         });

        // };

       peer.ontrack = (event) => {
            console.log("Remote Track");

            this.remoteStream = event.streams[0];
        };

       peer.onicecandidate = ({ candidate }) => {
            if (!candidate) return;
            socket.emit("ice-candidate", {
                to: this.receiverId,
                candidate,
            });
        };

        const offer = await peer.createOffer();

        await peer.setLocalDescription(offer);

        socket.emit("call-user", {
            to: this.receiverId,
            from: this.userId,
            offer,
            callType: type,
          })
      } catch (error) {
        console.log(error);
      }
    },

    /* ================= ACCEPT CALL ================= */
    async acceptCall() {
      try {
        const call = this.incomingCall;

        if (!call) return;

        this.receiverId = call.from;
        this.callType = call.callType;

        // 🔥 Save incoming call message
        if (this.chatId) {
          await api.post("/messages", {
            chatId: this.chatId,
            type: "call",
            content:
              call.callType === "video"
                ? "📹 Incoming Video Call"
                : "📞 Incoming Audio Call",
          });
        }

        const stream = await navigator.mediaDevices.getUserMedia({
               video:call.callType === "video"
                  ? {
                      width: 640,
                      height: 480,
                      facingMode: "user"
                    }
                  : false,

              audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
              },
          });

        this.localStream = stream;

        const peer = new RTCPeerConnection({

              iceServers: [

                  {
                      urls: [
                          "stun:stun.l.google.com:19302",
                          "stun:stun1.l.google.com:19302",
                      ],
                  },

                  {
                      urls: "stun:stun.cloudflare.com:3478",
                  },

              ],

          });

        this.peer = peer;

        peer.onconnectionstatechange = () => {

            console.log(
                "Connection State :",
                peer.connectionState
            );

        };

        peer.oniceconnectionstatechange = () => {

            console.log(
                "ICE State :",
                peer.iceConnectionState
            );

        };

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });

        
        peer.onnegotiationneeded = async () => {

            try {

                const offer = await peer.createOffer();

                await peer.setLocalDescription(offer);

            }

            catch (e) {

                console.log(e);

            }

        };




       peer.ontrack = (event) => {

          console.log("Remote Stream Accepted");

          this.remoteStream = event.streams[0];

      };

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              to: this.receiverId,
              candidate: event.candidate,
            });
          }
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

        this.callActive = true;
        this.incomingCall = null;
      } catch (error) {
        console.log(error);
      }
    },

    async rejectCall() {
      try {

        socket.emit("reject-call", {
          to: this.callerId,
        });

        if (this.peer) {
          this.peer.close();
          this.peer = null;
        }

        this.localStream?.getTracks().forEach(track => {
          track.stop();
        });

        this.remoteStream?.getTracks?.().forEach(track => {
          track.stop();
        });

        this.resetCall();

      } catch (error) {
        console.log(error);
      }
    },



    async endCall() {
      try {
        if (this.chatId) {
          await api.post("/messages", {
            chatId: this.chatId,
            type: "call",
            content:
              this.callType === "video"
                ? "📹 Call Ended"
                : "📞 Call Ended",
          });
        }

        if (this.peer) {
          this.peer.close();
          this.peer = null;
        }

        this.localStream?.getTracks().forEach((track) =>
          track.stop()
        );
        
        this.remoteStream?.getTracks?.().forEach(track => {
          track.stop();
        });

        this.remoteStream = null;

        socket.emit("call-ended", {
          to: this.receiverId || this.callerId,
        });

        this.resetCall();
      } catch (error) {
        console.log(error);
      }
    },

    /* ================= RESET ================= */
    resetCall() {
      this.incomingCall = null;
      this.callActive = false;
      this.peer = null;
      this.localStream = null;
      this.remoteStream = null;
      this.callType = null;
      this.receiverId = null;
      this.callerId = null;
    },
  },



});