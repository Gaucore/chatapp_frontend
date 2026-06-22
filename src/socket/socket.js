import { io } from "socket.io-client";

const socket = io("https://chatapp-backend-3exy.onrender.com", {
  autoConnect: false,
});

// const socket = io("http://localhost:5000/", {
//   autoConnect: false,
// });


export default socket;