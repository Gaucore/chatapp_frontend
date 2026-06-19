import { io } from "socket.io-client";

const socket = io("https://chatapp-backend-3exy.onrender.com", {
  autoConnect: false,
});

export default socket;