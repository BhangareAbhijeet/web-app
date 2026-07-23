import { io } from "socket.io-client";

const socket = io("https://avelina-synonymical-leticia.ngrok-free.dev", {
  transports: ["websocket"],
});

export default socket;
