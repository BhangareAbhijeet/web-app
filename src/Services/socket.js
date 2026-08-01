import { io } from "socket.io-client";

const SOCKET_URL = "https://anteater-tattle-parted.ngrok-free.dev";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // use websocket instead of polling
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("✅ SOCKET CONNECTED:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ SOCKET CONNECTION ERROR:", error);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 SOCKET DISCONNECTED:", reason);
});

export default socket;
